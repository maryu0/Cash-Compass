import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { config } from "./config/config.js";
import { connectDB } from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
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

// CORS configuration
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
  })
);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/auth", authRoutes);

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
        login: "POST /api/auth/login",
        profile: "GET /api/auth/me",
        updateProfile: "PUT /api/auth/profile",
        changePassword: "PUT /api/auth/change-password",
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
