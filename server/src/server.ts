
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import type { Db } from "mongodb";
import { connectDatabase } from "./config/database.js";

// Load environment variables
dotenv.config();

const app = express();

let database: Db | null = null;

// Middleware
app.use(cors());
app.use(express.json());

// Basic API health-check
app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to MentorLagbe API!",
  });
});

// MongoDB health-check
app.get("/health/db", async (_req, res) => {
  try {
    if (!database) {
      res.status(503).json({
        success: false,
        message: "Database is not connected",
      });
      return;
    }

    await database.command({ ping: 1 });

    res.status(200).json({
      success: true,
      message: "MongoDB is responding successfully!",
    });
  } catch (error) {
    console.error("Database ping failed:", error);

    res.status(500).json({
      success: false,
      message: "Database ping failed",
    });
  }
});

// Start the server after connecting to MongoDB
async function startServer() {
  try {
    database = await connectDatabase();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`MentorLagbe API is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start MentorLagbe API:", error);
    process.exit(1);
  }
}

startServer();
