const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");

const app = express();
const server = http.createServer(app);

app.set("trust proxy", 1);
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "https://accounts.google.com",
          "https://cdn.jsdelivr.net",
        ],
        connectSrc: ["'self'", "https://accounts.google.com"],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "https:",
          "https://cdn.jsdelivr.net",
        ],
        fontSrc: ["'self'", "https:", "data:"],
        styleSrc: ["'self'", "'unsafe-inline'", "https:"],
        frameSrc: ["'self'", "https://accounts.google.com"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
);

// Allowed Origins
const normalizeOrigin = (origin) => (origin || "").replace(/\/+$/, "");

const ALLOWED_ORIGINS = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  "https://fitness-app-pied-tau.vercel.app",
  "https://fitness-app1-chi.vercel.app",
  "https://fitnessapp-0cgj.onrender.com",
]
  .filter(Boolean)
  .map(normalizeOrigin);

// CORS
const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      if (process.env.NODE_ENV !== 'production') return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    }

    if (ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }

    logger.warn("Blocked Origin:", origin);

    callback(new Error("Not allowed by CORS"));
  },

  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use(cookieParser());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Socket.IO
const io = new Server(server, {
  cors: corsOptions,
});

app.set("io", io);

// Health Check

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Vitalis Backend API Running",
    environment: process.env.NODE_ENV || "development",
  });
});

// Routes

const authRoutes = require("./routes/auth.routes");
const messengerRoutes = require("./routes/messenger.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const sleepRoutes = require("./routes/sleep.routes");
const logsRoutes = require("./routes/logs.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const plansRoutes = require("./routes/plans.routes");
const profileRoutes = require("./routes/profile.routes");
const aiRoutes = require("./routes/ai.routes");
const atelierRoutes = require("./routes/atelier.routes");
const foodLogs = require("./routes/foodLogs.routes");
const dailyNutrition = require("./routes/dailyNutrition.routes");
const bmiRoutes = require("./routes/bmi.routes");
const clinicalRoutes = require("./routes/clinic.routes");
const activityRoutes = require("./routes/activity.routes");
const securityRoutes = require("./routes/security.routes");
const notificationRoutes = require("./routes/notification.routes");
const sessionRoutes = require("./routes/session.routes");
const coachRoutes = require("./routes/coach.routes");
const workoutLogRoutes = require("./routes/workoutLogs.routes");
const forgotPasswordRoutes = require("./routes/forgotPassword.routes");
const feedbackRoutes = require("./routes/feedback.routes");
const statsRoutes = require("./routes/stats.routes");
const publicRoutes = require("./routes/public.routes");

app.use("/api/bmi", bmiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", messengerRoutes);
app.use("/api", dashboardRoutes);
app.use("/api/sleep", sleepRoutes);
app.use("/api/logs", logsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/plans", plansRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api", aiRoutes);
app.use("/api/atelier", atelierRoutes);
app.use("/api/food-logs", foodLogs);
app.use("/api/nutrition", dailyNutrition);
app.use("/api/clinic", clinicalRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/security", securityRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/workout-sessions", sessionRoutes);
app.use("/api/coach", coachRoutes);
app.use("/api/workout-logs", workoutLogRoutes);
app.use("/api/forgot-password", forgotPasswordRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/public", publicRoutes);


app.get("/api/admin/migrate", async (req, res) => {
  const expected = String(process.env.MIGRATE_TOKEN || "");

  if (!expected) {
    logger.error("[AdminMigrate] MIGRATE_TOKEN is not set in the environment â€” refusing all requests.");
    return res.status(503).json({
      success: false,
      message: "Migration endpoint is disabled: MIGRATE_TOKEN is not configured on the server.",
    });
  }

  const crypto = require('crypto');
  const token = String(req.headers["x-migrate-token"] || "");
  let okToken = false;
  if (token.length > 0 && expected.length > 0) {
    try {
      const bufA = Buffer.from(token);
      const bufB = Buffer.from(expected);
      if (bufA.length === bufB.length) {
        okToken = crypto.timingSafeEqual(bufA, bufB);
      }
    } catch { okToken = false; }
  }

  if (!okToken) {
    logger.warn(`[AdminMigrate] rejected request â€” token length ${token.length}`);
    return res.status(401).json({ success: false, message: "Invalid migrate token" });
  }
  try {
    const db = require("./config/db");
    const fs = require("fs");
    const path = require("path");
const logger = require('./utils/logger');
    const [tables] = await db.query("SHOW TABLES");
    const tableNames = tables.map(r => Object.values(r)[0]);
    const hasUsers = tableNames.includes("users");
    const targetDb = String(process.env.DB_NAME || "").toLowerCase();
    const result = { dbHost: process.env.DB_HOST, dbName: process.env.DB_NAME, beforeTables: tableNames, hasUsers, ran: [] };
    // Deploy to both DBs if fitnessapp exists on Aiven (you now have defaultdb + fitnessapp) â€” ensure both get schema
    const files = hasUsers ? ["004_add_exercise_slug_to_plan_exercises.sql", "005_add_emoji_to_food_logs.sql"] : ["000_baseline_schema.sql", "004_add_exercise_slug_to_plan_exercises.sql", "005_add_emoji_to_food_logs.sql"];
    for (const file of files) {
      const full = path.join(__dirname, "../migrations", file);
      if (!fs.existsSync(full)) { result.ran.push({ file, status: "not_found" }); continue; }
      let sql = fs.readFileSync(full, "utf8");
      if (file === "000_baseline_schema.sql" && targetDb === "defaultdb") {
        sql = sql.replace(/CREATE DATABASE IF NOT EXISTS `fitnessapp`[^;]*;/, "");
        sql = sql.replace(/USE `fitnessapp`;/, "USE `defaultdb`;");
      }
      const cleaned = sql.replace(/--.*$/gm, "");
      const stmts = cleaned.split(";").map(s => s.trim()).filter(Boolean);
      let ok = 0, skipped = 0, failed = null;
      for (const stmt of stmts) {
        try { await db.query(stmt); ok++; } catch (e) {
          const msg = e.message || "";
          if (msg.includes("Duplicate column") || msg.includes("Duplicate key") || msg.includes("already exists") || msg.includes("Duplicate entry")) skipped++;
          else { failed = msg.slice(0,300); break; }
        }
      }
      result.ran.push({ file, statements: stmts.length, ok, skipped, failed });
      if (failed) break;
    }
    const [after] = await db.query("SHOW TABLES");
    result.afterTables = after.map(r => Object.values(r)[0]);
    const [users] = await db.query("SHOW TABLES LIKE 'users'").catch(() => [[]]);
    result.usersExists = users.length > 0;
    res.json({ success: true, message: hasUsers ? "Migration check done" : "Baseline deployed", ...result });
  } catch (e) {
    logger.error("[AdminMigrate] error:", e);
    res.status(500).json({ success: false, message: 'Migration failed' });
  }
});

// ============================
// Socket Handler
// ============================

require("./sockets/socketHandler")(io);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ============================
// Error Handler
// ============================

app.use((err, req, res, next) => {
  logger.error(err);

  res.status(err.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message,
  });
});

module.exports = { app, server };