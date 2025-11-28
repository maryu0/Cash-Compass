import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongodb: {
    uri: process.env.MONGODB_URI || "mongodb://localhost:27017/cashcompass",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "fallback-secret-key",
    expire: process.env.JWT_EXPIRE || "7d",
  },
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  },
};
