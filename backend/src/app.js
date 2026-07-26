const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
const server = http.createServer(app);

// Trust Render/Railway proxy
app.set("trust proxy", 1);

// ============================
// Allowed Origins
// ============================

const ALLOWED_ORIGINS = [
  process.env.CLIENT_URL,
  "https://fitness-app1-chi.vercel.app/",
  "https://fitnessapp-0cgj.onrender.com",
];

// ============================
// CORS
// ============================

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);

    if (ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }

    if (origin.endsWith(".devtunnels.ms")) {
      return callback(null, true);
    }

    console.warn("Blocked Origin:", origin);

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

// ============================
// Socket.IO
// ============================

const io = new Server(server, {
  cors: corsOptions,
});

app.set("io", io);

// ============================
// Health Check
// ============================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Vitalis Backend API Running",
    environment: process.env.NODE_ENV || "development",
  });
});

// ============================
// Routes
// ============================

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

// NOTE: liveCoaching.routes.js and social.routes.js exist (carried over
// from route/liveCoaching.js and route/social.js) but were NOT mounted
// in the original server.js either — preserved as unmounted here too.
// See the summary notes for details on both.

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

// ============================
// Socket Handler
// ============================

require("./sockets/socketHandler")(io);

// ============================
// 404 Handler
// ============================
// NOTE: no path pattern here — this middleware catches any request that
// hasn't matched a route above. A bare "*" string is no longer accepted
// by the version of path-to-regexp Express now depends on, so we simply
// omit the path (Express treats an unpathed app.use as "match everything").

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
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message,
  });
});

module.exports = { app, server };
