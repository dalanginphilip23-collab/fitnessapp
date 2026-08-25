// One-click runner for Railway / local: node scripts/run-migration-004.js
// Uses your existing .env DB_* and handles "already exists" gracefully.
const db = require('../src/config/db');

async function run() {
  console.log('— Migration 004: exercise_slug —');
  try {
    const [cols] = await db.query(`SHOW COLUMNS FROM \`plan_exercises\` LIKE 'exercise_slug'`);
    if (cols.length === 0) {
      console.log('Adding column exercise_slug...');
      await db.query(`ALTER TABLE \`plan_exercises\` ADD COLUMN \`exercise_slug\` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER \`exercise_name\``);
      console.log('Column added.');
    } else {
      console.log('Column exercise_slug already exists — skipping ADD COLUMN.');
    }
  } catch (e) {
    console.error('ADD COLUMN error (likely already exists):', e.message);
  }

  try {
    await db.query(`ALTER TABLE \`plan_exercises\` ADD INDEX \`idx_exercise_slug\` (\`exercise_slug\`)`);
    console.log('Index idx_exercise_slug created.');
  } catch (e) {
    if (String(e.message).includes('Duplicate')) console.log('Index already exists — skipping.');
    else console.error('ADD INDEX error:', e.message);
  }

  const updates = [
    [`squat`, `('Barbell Back Squat','Back Squat','Bodyweight Squats','Goblet Squats','Jump Squats','Front Squat','Bulgarian Split Squat','Leg Press')`],
    [`pushup`, `('Flat Barbell Bench Press','Barbell Bench Press','Push-Ups','Push-Up to Renegade Row','Incline Dumbbell Press','Bench Press','Weighted Pushup')`],
    [`pullup`, `('Bent-Over Barbell Row','Barbell Bent-Over Row','Single-Arm Dumbbell Row','Assisted Pull-Up or Inverted Row','Weighted Pull-Ups','Seated Cable Row','Resistance Band Rows')`],
    [`plank`, `('Plank Hold','Weighted Plank','Plank Shoulder Taps','Plank')`],
    [`sideplank`, `'Side Plank'`],
    [`overhead`, `('Standing Overhead Press','Standing Barbell Overhead Press')`],
    [`deadlift`, `('Conventional Deadlift','Romanian Deadlift')`],
    [`dip`, `('Weighted Dips','Dips')`],
    [`tricep_ext`, `'Triceps Rope Pushdown'`],
    [`lateral_raise`, `('Cable Lateral Raise','Lateral Raise')`],
    [`bicep_curl`, `'Barbell Bicep Curl'`],
    [`lunge`, `('Walking Lunges','Deep Lunge Hip Opener')`],
    [`hip_thrust`, `('Hip Thrust','Kettlebell Swings')`],
    [`glute_bridge`, `('Glute Bridges','Glute Bridge')`],
    [`boxjump`, `'Box Jumps'`],
    [`burpee`, `'Burpees'`],
    [`jumpingjack`, `'Jumping Jacks'`],
    [`mountainclimb`, `'Mountain Climbers'`],
    [`highknee`, `('High Knees','Sprint Intervals','Hill Sprints or Resisted Intervals')`],
    [`crunch`, `('Crunches','Hanging Knee Raise','Hanging Leg Raise','Dead Bug')`],
    [`situp`, `'Sit-Ups'`],
    [`calfraise`, `('Standing Calf Raise','Calf Raises')`],
  ];

  for (const [slug, names] of updates) {
    const where = names.startsWith('(') ? `exercise_name IN ${names}` : `exercise_name=${names}`;
    const [r] = await db.query(`UPDATE \`plan_exercises\` SET \`exercise_slug\`=? WHERE ${where}`, [slug]);
    console.log(`Backfilled ${slug}: ${r.affectedRows} rows`);
  }
  // supersets
  await db.query(`UPDATE \`plan_exercises\` SET \`exercise_slug\`='pushup' WHERE exercise_name LIKE '%Incline DB Press%' OR exercise_name LIKE '%Chest-Supported Row%'`);
  await db.query(`UPDATE \`plan_exercises\` SET \`exercise_slug\`='overhead' WHERE exercise_name LIKE '%DB Shoulder Press%'`);
  await db.query(`UPDATE \`plan_exercises\` SET \`exercise_slug\`='pullup' WHERE exercise_name LIKE '%Cable Fly%'`);
  console.log('Supersets backfilled.');
  const [rows] = await db.query(`SELECT exercise_name, exercise_slug, COUNT(*) c FROM plan_exercises GROUP BY exercise_name, exercise_slug ORDER BY exercise_name LIMIT 30`);
  console.table(rows);
  console.log('Done.');
  process.exit(0);
}
run().catch(e=>{console.error(e); process.exit(1);});
