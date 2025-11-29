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
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5173",
    ],
  },
};
