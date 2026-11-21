
import express from "express";
import { createTuitionRouter } from "./routes/tuition.routes.js";
import cors from "cors";
import dotenv from "dotenv";
import { createUploadRouter } from "./routes/upload.routes.js";
import { createApplicationRouter } from "./routes/application.routes.js";
import type { Db } from "mongodb";
import { createUserRouter } from "./routes/user.routes.js";
import { createPaymentRouter } from "./routes/payment.routes.js";

import { toNodeHandler } from "better-auth/node";

import {
  connectDatabase,
  getMongoClient,
  initializeDatabaseIndexes,
} from "./config/database.js";
import { createAuth } from "./auth/auth.js";
import { createAuthMiddleware } from "./middleware/auth.middleware.js";

// Load environment variables
dotenv.config();

const app = express();

let database: Db | null = null;

// CORS must allow credentials for Better Auth cookies.
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
);

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
    await initializeDatabaseIndexes(database);

    // Initialize Better Auth after MongoDB is connected.
    const auth = createAuth(database, getMongoClient());

    // Initialize JWT authentication and role middleware.
    const authMiddleware = createAuthMiddleware(database);

    // Better Auth handler must be registered before express.json().
    app.all("/api/auth/*splat", toNodeHandler(auth));

    // Parse JSON for our other API routes.
    app.use(express.json());

    // Protected route: returns the currently authenticated user.
    app.get(
      "/api/me",
      authMiddleware.verifyToken,
      (_req, res) => {
        res.status(200).json({
          success: true,
          user: res.locals.authUser,
        });
      },
    );
    app.use("/api/users", createUserRouter(database));
    app.use("/api/tuitions", createTuitionRouter(database));
    app.use("/api/applications", createApplicationRouter(database));
    app.use("/api/payments", createPaymentRouter(database));
    app.use("/api/uploads", createUploadRouter(database));
    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log("Better Auth initialized successfully!");
      console.log("JWT authentication middleware initialized!");
      console.log(`MentorLagbe API is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start MentorLagbe API:", error);
    process.exit(1);
  }
}

startServer();
