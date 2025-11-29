import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { config } from "./config/config.js";
import { connectDB } from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api", limiter);

// CORS configuration - Allow multiple origins for development
const allowedOrigins = config.cors.origin;

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(null, true); // Allow all origins in development
      }
    },
    credentials: true,
  })
);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/goals", goalRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CashCompass API is running",
    timestamp: new Date().toISOString(),
  });
});

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to CashCompass API",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      auth: {
        signup: "POST /api/auth/signup",
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        profile: "GET /api/auth/me",
        updateProfile: "PUT /api/auth/profile",
        changePassword: "PUT /api/auth/change-password",
      },
      dashboard: {
        getData: "GET /api/dashboard",
        riskScore: "GET /api/dashboard/risk-score",
        monitoring: "GET /api/dashboard/monitoring",
        startMonitoring: "POST /api/dashboard/monitoring/start",
        stopMonitoring: "POST /api/dashboard/monitoring/stop",
      },
      transactions: {
        list: "GET /api/transactions",
        summary: "GET /api/transactions/summary",
        create: "POST /api/transactions",
        bulkImport: "POST /api/transactions/bulk",
        get: "GET /api/transactions/:id",
        update: "PUT /api/transactions/:id",
        delete: "DELETE /api/transactions/:id",
      },
      alerts: {
        list: "GET /api/alerts",
        create: "POST /api/alerts",
        get: "GET /api/alerts/:id",
        markRead: "PUT /api/alerts/:id/read",
        markAllRead: "PUT /api/alerts/read-all",
        resolve: "PUT /api/alerts/:id/resolve",
        delete: "DELETE /api/alerts/:id",
        clear: "DELETE /api/alerts/clear",
      },
      goals: {
        list: "GET /api/goals",
        create: "POST /api/goals",
        get: "GET /api/goals/:id",
        update: "PUT /api/goals/:id",
        addProgress: "PUT /api/goals/:id/add",
        archive: "PUT /api/goals/:id/archive",
        delete: "DELETE /api/goals/:id",
      },
    },
  });
});

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║   🚀 CashCompass Backend Server Running   ║
╠═══════════════════════════════════════════╣
║   Environment: ${config.nodeEnv.padEnd(28)}║
║   Port:        ${PORT.toString().padEnd(28)}║
║   Database:    MongoDB Connected          ║
╚═══════════════════════════════════════════╝
  `);
});

export default app;
