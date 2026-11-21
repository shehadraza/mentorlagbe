
import { MongoClient, Db } from "mongodb";
import { setServers } from "node:dns";

// Use public DNS servers for MongoDB SRV lookup
setServers(["1.1.1.1", "8.8.8.8"]);

// Connect to MongoDB Atlas
export async function connectDatabase(): Promise<Db> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is missing from the .env file");
  }

  try {
    const client = new MongoClient(uri);

    await client.connect();

    const database = client.db("mentorlagbe");

    console.log("MongoDB connected successfully!");

    return database;
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
}
