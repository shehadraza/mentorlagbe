
import "dotenv/config";

import type { Document } from "mongodb";
import { connectDatabase, getMongoClient } from "../config/database.js";

type AuthDocument = Document & {
  _id: string;
  _authModel?: string;
  role?: string;
  email?: string;
  userId?: string;
};

async function deleteAdmin() {
  let client: ReturnType<typeof getMongoClient> | null = null;

  try {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const confirmation = process.env.CONFIRM_DELETE_ADMIN;

    if (!email || confirmation !== "YES") {
      throw new Error(
        "Set ADMIN_EMAIL and CONFIRM_DELETE_ADMIN=YES first."
      );
    }

    const database = await connectDatabase();
    client = getMongoClient();

    const users = database.collection<AuthDocument>("users");

    const admin = await users.findOne({
      email,
      _authModel: "user",
      role: "admin",
    });

    if (!admin) {
      throw new Error(
        "No admin account found for this email. Nothing was deleted."
      );
    }

    const userId = admin._id;

    const accountResult = await users.deleteMany({
      _authModel: "account",
      userId,
    });

    const sessionResult = await users.deleteMany({
      _authModel: "session",
      userId,
    });

    const userResult = await users.deleteOne({
      _id: userId,
      _authModel: "user",
      role: "admin",
    });

    if (userResult.deletedCount !== 1) {
      throw new Error("Admin user deletion could not be confirmed.");
    }

    console.log("Admin account deleted successfully!");
    console.log("Deleted account records:", accountResult.deletedCount);
    console.log("Deleted session records:", sessionResult.deletedCount);
    console.log("Deleted admin user:", userResult.deletedCount);
    console.log("Other users and collections were not modified.");
  } catch (error) {
    console.error("Admin deletion failed:");
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  } finally {
    if (client) {
      await client.close();
    }
  }
}

deleteAdmin();
