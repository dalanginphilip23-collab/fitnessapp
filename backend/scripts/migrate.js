// Generic migration runner — tracks applied migrations in _migrations table
// Usage: node scripts/migrate.js   or   npm run migrate
// Works locally and on Railway: railway run npm run migrate
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const db = require('../src/config/db');

async function ensureMigrationsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
}

async function getApplied() {
  const [rows] = await db.query(`SELECT name FROM _migrations ORDER BY name`);
  return new Set(rows.map(r => r.name));
}

function splitStatements(sql) {
  // naive split on ; outside of strings/comments — good enough for our migrations
  // remove line comments first for simpler split, keep -- inside strings? migration files are simple
  const cleaned = sql.replace(/--.*$/gm, '');
  return cleaned.split(';').map(s => s.trim()).filter(s => s.length > 0);
}

async function run() {
  console.log('— Vitalis Migrator —');
  console.log(`DB: ${process.env.DB_HOST}/${process.env.DB_NAME} as ${process.env.DB_USER}`);
  await ensureMigrationsTable();
  const applied = await getApplied();
  console.log('Applied:', [...applied].join(', ') || '(none)');

  const dir = path.join(__dirname, '../migrations');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();
  console.log('Found:', files.join(', '));

  // Only run migrations that add columns/tables, skip baseline if DB already has tables
  // 000 is baseline dump — only needed for fresh DB
  const [tables] = await db.query(`SHOW TABLES`);
  const hasPlans = tables.some(r => Object.values(r).includes('plans'));
  const toRun = files.filter(f => {
    if (f === '000_baseline_schema.sql' && hasPlans) return false;
    return !applied.has(f);
  });

  if (toRun.length === 0) {
    console.log('No pending migrations.');
    // still ensure 004 backfill even if file marked applied but column missing (idempotent)
    // force check for 004 if column missing
    try {
      const [cols] = await db.query(`SHOW COLUMNS FROM plan_exercises LIKE 'exercise_slug'`);
      if (cols.length === 0 && files.includes('004_add_exercise_slug_to_plan_exercises.sql')) {
        console.log('004 column missing but marked applied — forcing re-run of 004...');
        toRun.push('004_add_exercise_slug_to_plan_exercises.sql');
      }
    } catch (e) {}
    if (toRun.length === 0) return process.exit(0);
  }

  console.log('Pending:', toRun.join(', '));
  for (const file of toRun) {
    const full = path.join(dir, file);
    const sql = fs.readFileSync(full, 'utf8');
    const stmts = splitStatements(sql);
    console.log(`\n>> ${file} (${stmts.length} statements)`);
    for (let i = 0; i < stmts.length; i++) {
      const stmt = stmts[i];
      if (!stmt) continue;
      try {
        await db.query(stmt);
        const preview = stmt.slice(0, 80).replace(/\n/g, ' ');
        console.log(`  [${i+1}/${stmts.length}] OK: ${preview}...`);
      } catch (e) {
        const msg = e.message || '';
        if (msg.includes('Duplicate column') || msg.includes('Duplicate key') || msg.includes('already exists') || msg.includes('Duplicate entry')) {
          console.log(`  [${i+1}/${stmts.length}] SKIP (already exists): ${msg.split('\n')[0]}`);
        } else {
          console.error(`  [${i+1}/${stmts.length}] FAIL: ${msg}`);
          console.error('Statement:', stmt.slice(0, 200));
          throw e;
        }
      }
    }
    try {
      await db.query(`INSERT INTO _migrations (name) VALUES (?)`, [file]);
    } catch (e) {}
    console.log(`✓ ${file} done`);
  }
  console.log('\nAll migrations applied.');
  process.exit(0);
}

run().catch(e => {
  if (e.code === 'ECONNREFUSED') {
    console.error('DB connection refused — is MySQL running? On Railway use: railway run npm run migrate');
    console.error(`Tried ${process.env.DB_HOST}:${process.env.DB_PORT || 3306} as ${process.env.DB_USER}`);
  } else {
    console.error('Migrate failed:', e);
  }
  process.exit(1);
});
