const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

require("dotenv").config();

const { server } = require("./src/app");
const { verifyTransport } = require("./src/services/mail");

async function ensureSchema() {
  // Auto-migrate on boot for fresh Aiven DB (defaultdb.users missing)
  try {
    const db = require("./src/config/db");
    const fs = require("fs");
    const path = require("path");
    const [tables] = await db.query("SHOW TABLES");
    const hasUsers = tables.some(r => Object.values(r).includes("users"));
    if (hasUsers) {
      console.log("[Schema] users table exists — skip auto-migrate");
      return;
    }
    console.log("[Schema] users table missing — running 000_baseline_schema.sql + 004...");
    const files = ["000_baseline_schema.sql", "004_add_exercise_slug_to_plan_exercises.sql"];
    for (const file of files) {
      const full = path.join(__dirname, "migrations", file);
      if (!fs.existsSync(full)) { console.warn(`[Schema] ${file} not found, skip`); continue; }
      let sql = fs.readFileSync(full, "utf8");
      // Aiven uses defaultdb, baseline was dumped with fitnessapp — rewrite for defaultdb
      if (file === "000_baseline_schema.sql" && String(process.env.DB_NAME || "").toLowerCase() === "defaultdb") {
        sql = sql.replace(/CREATE DATABASE IF NOT EXISTS `fitnessapp`[^;]*;/, "");
        sql = sql.replace(/USE `fitnessapp`;/, "USE `defaultdb`;");
      }
      const cleaned = sql.replace(/--.*$/gm, "");
      const stmts = cleaned.split(";").map(s => s.trim()).filter(Boolean);
      console.log(`[Schema] ${file}: ${stmts.length} statements`);
      for (const stmt of stmts) {
        try { await db.query(stmt); } catch (e) {
          const msg = e.message || "";
          if (msg.includes("Duplicate column") || msg.includes("Duplicate key") || msg.includes("already exists") || msg.includes("Duplicate entry")) continue;
          throw e;
        }
      }
      console.log(`[Schema] ✓ ${file} done`);
    }
    console.log("[Schema] auto-migrate complete");
  } catch (e) {
    console.error("[Schema] auto-migrate failed (app will still start):", e.message);
  }
}

// Start Server
const PORT = process.env.PORT || 3000;

ensureSchema().finally(() => {
  server.listen(PORT, () => {
    console.log("================================");
    console.log("🚀 Vitalis Backend Started");
    console.log("================================");
    console.log(`PORT: ${PORT}`);
    console.log(`NODE_ENV: ${process.env.NODE_ENV || "development"}`);

    verifyTransport();
  });
});
