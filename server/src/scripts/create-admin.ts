
import "dotenv/config";

import { connectDatabase, getMongoClient } from "../config/database.js";
import type { Document } from "mongodb";
import { createAuth } from "../auth/auth.js";

type AuthDocument = Document & {
  _id: string;
  _authModel?: string;
  role?: string;
  email?: string;
  userId?: string;
};

async function createAdmin() {
  let client: ReturnType<typeof getMongoClient> | null = null;
  let createdUserId: string | null = null;

  try {
    const name = process.env.ADMIN_NAME?.trim();
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;

    if (!name || !email || !password) {
      throw new Error(
        "ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD must be provided."
      );
    }

    if (password.length < 8) {
      throw new Error("Admin password must be at least 8 characters.");
    }

    const database = await connectDatabase();
    client = getMongoClient();

    const users = database.collection<AuthDocument>("users");

    const existingUser = await users.findOne({
      email,
      _authModel: "user",
    });

    if (existingUser) {
      throw new Error(
        "This email already has an account. No existing account was changed."
      );
    }

    const existingAdmin = await users.findOne({
      _authModel: "user",
      role: "admin",
    });

    if (existingAdmin) {
      throw new Error(
        "An admin account already exists. Bootstrap stopped."
      );
    }

    const auth = createAuth(database, client);

    // Create the account through Better Auth.
    // The public signup hook initially assigns the student role.
    const result = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
    });

    createdUserId = result.user.id;

    // Promote only this newly created account.
    const updateResult = await users.updateOne(
      {
        _id: createdUserId,
        _authModel: "user",
        role: "student",
      },
      {
        $set: {
          role: "admin",
          plan: "free",
        },
      }
    );

    if (updateResult.modifiedCount !== 1) {
      throw new Error("Admin role promotion failed.");
    }

    // Remove the temporary session created during signup.
    await users.deleteMany({
      _authModel: "session",
      userId: createdUserId,
    });

    console.log("Admin account created successfully!");
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Role: admin");
    console.log("Plan: free");
    console.log("Temporary signup session removed.");
    console.log("You can now sign in using the Admin account.");
  } catch (error) {
    console.error("Admin creation failed:");

    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }

    // If promotion fails, remove the newly created account records.
    if (client && createdUserId) {
      try {
        const database = client.db("mentorlagbe");
        await database.collection<AuthDocument>("users").deleteMany({
          $or: [
            { _id: createdUserId, _authModel: "user" },
            { userId: createdUserId, _authModel: "account" },
            { userId: createdUserId, _authModel: "session" },
          ],
        });
      } catch {
        console.error("Warning: automatic cleanup failed.");
      }
    }

    process.exitCode = 1;
  } finally {
    if (client) {
      await client.close();
    }
  }
}

createAdmin();
