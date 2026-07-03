if (process.env.NODE_ENV === "development") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

require("dotenv").config();

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
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.CLIENT_URL,
  "https://your-frontend.vercel.app",
  "https://fitness-app-backend-nkh0.onrender.com",
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

const authRoutes = require("./route/auth");
const messengerRoutes = require("./route/messenger");
const dashboardRoutes = require("./route/dashboard");
const sleepRoutes = require("./route/sleep");
const logsRoutes = require("./route/logs");
const analyticsRoutes = require("./route/analytics");
const plansRoutes = require("./route/plans");
const profileRoutes = require("./route/profile");
const aiRoutes = require("./route/ai");
const atelierRoutes = require("./route/atelier");
const foodLogs = require("./route/foodLogs");
const dailyNutrition = require("./route/dailyNutrition");
const bmiRoutes = require("./route/bmi");
const clinicalRoutes = require("./route/clinic");
const activityRoutes = require("./route/activity");
const securityRoutes = require("./route/security");
const notificationRoutes = require("./route/notification");
const sessionRoutes = require("./route/session");
const coachRoutes = require("./route/coach");
const workoutLogRoutes = require("./route/workoutLogs");
const forgotPasswordRoutes = require("./route/forgotpassword");
const feedbackRoutes = require("./route/feedback");
const statsRoutes = require("./route/stats");

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

require("./socket/socketHandler")(io);

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

// ============================
// Start Server
// ============================

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("================================");
  console.log("🚀 Vitalis Backend Started");
  console.log("================================");
  console.log(`PORT: ${PORT}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV || "development"}`);
});