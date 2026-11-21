
import { MongoClient, type Db } from "mongodb";
import { setServers } from "node:dns";

// Use public DNS servers for MongoDB SRV lookup.
setServers(["1.1.1.1", "8.8.8.8"]);

let mongoClient: MongoClient | null = null;

// Get the connected MongoDB client.
export function getMongoClient(): MongoClient {
  if (!mongoClient) {
    throw new Error("MongoDB client is not connected");
  }

  return mongoClient;
}

// Ensure the four required collections exist.
async function ensureCollections(database: Db): Promise<void> {
  const requiredCollections = [
    "users",
    "tuitions",
    "applications",
    "payments",
  ];

  const existingCollections = await database
    .listCollections({}, { nameOnly: true })
    .toArray();

  const existingNames = new Set(
    existingCollections.map((collection) => collection.name)
  );

  for (const collectionName of requiredCollections) {
    if (!existingNames.has(collectionName)) {
      await database.createCollection(collectionName);
      console.log(`MongoDB collection created: ${collectionName}`);
    }
  }
}

// Create indexes for performance and data integrity.
export async function initializeDatabaseIndexes(
  database: Db
): Promise<void> {
  await ensureCollections(database);

  const users = database.collection("users");
  const tuitions = database.collection("tuitions");
  const applications = database.collection("applications");
  const payments = database.collection("payments");

  await Promise.all([
    // Better Auth models share the users collection.
    users.createIndex(
      { _authModel: 1 },
      { name: "auth_model_lookup" }
    ),

    users.createIndex(
      { email: 1 },
      {
        name: "user_email_unique",
        unique: true,
        partialFilterExpression: { _authModel: "user" },
      }
    ),

    users.createIndex(
      { token: 1 },
      {
        name: "session_token_unique",
        unique: true,
        partialFilterExpression: { _authModel: "session" },
      }
    ),

    users.createIndex(
      { providerId: 1, accountId: 1 },
      {
        name: "account_provider_unique",
        unique: true,
        partialFilterExpression: { _authModel: "account" },
      }
    ),

    users.createIndex(
      { userId: 1 },
      {
        name: "auth_user_lookup",
        partialFilterExpression: {
          _authModel: { $in: ["session", "account"] },
        },
      }
    ),

    // Tuition search and tutor dashboard.
    tuitions.createIndex(
      { approvalStatus: 1, isActive: 1, createdAt: -1 },
      { name: "public_tuition_listing" }
    ),

    tuitions.createIndex(
      { tutorEmail: 1, createdAt: -1 },
      { name: "tutor_tuition_lookup" }
    ),

    // Prevent duplicate student applications.
    applications.createIndex(
      { tuitionId: 1, studentEmail: 1 },
      {
        name: "unique_student_tuition_application",
        unique: true,
      }
    ),

    applications.createIndex(
      { tutorEmail: 1, appliedAt: -1 },
      { name: "tutor_applications_lookup" }
    ),

    applications.createIndex(
      { studentEmail: 1, appliedAt: -1 },
      { name: "student_applications_lookup" }
    ),

    // Payment and transaction lookups.
    payments.createIndex(
      { stripeSessionId: 1 },
      {
        name: "unique_stripe_session",
        unique: true,
      }
    ),

    payments.createIndex(
      { userEmail: 1, createdAt: -1 },
      { name: "user_payment_history" }
    ),
  ]);

  console.log("MongoDB indexes initialized successfully!");
}

// Connect to MongoDB Atlas.
export async function connectDatabase(): Promise<Db> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is missing from the .env file");
  }

  try {
    const client = new MongoClient(uri);

    await client.connect();

    mongoClient = client;

    const database = client.db("mentorlagbe");

    console.log("MongoDB connected successfully!");

    return database;
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
}
