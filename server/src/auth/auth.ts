
import { betterAuth } from "better-auth";
import { createAdapterFactory } from "better-auth/adapters";
import { jwt } from "better-auth/plugins";
import type { Db, MongoClient } from "mongodb";

import { createMongoDBAdapter } from "./mongodb-adapter.js";

export function createAuth(database: Db, client: MongoClient) {
  const secret = process.env.BETTER_AUTH_SECRET;

  if (!secret) {
    throw new Error("BETTER_AUTH_SECRET is missing from the .env file");
  }

  const databaseAdapter = createAdapterFactory({
    config: {
      adapterId: "mentorlagbe-mongodb",
      adapterName: "MentorLagbe MongoDB Adapter",

      supportsNumericIds: false,
      supportsJSON: true,
      supportsDates: true,
      supportsBooleans: true,
      supportsArrays: true,

      mapKeysTransformInput: {
        id: "_id",
      },

      mapKeysTransformOutput: {
        _id: "id",
      },

      // Transactions will be implemented separately.
      transaction: false,
    },

    adapter: createMongoDBAdapter(database, client),
  });

  return betterAuth({
    appName: "MentorLagbe",
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5000",
    secret,

    database: databaseAdapter,

    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
    },

    user: {
      additionalFields: {
        role: {
          type: "string",
          required: true,
          defaultValue: "student",
          input: true,
        },

        phone: {
          type: "string",
          required: false,
          input: true,
        },

        bio: {
          type: "string",
          required: false,
          input: true,
        },

        plan: {
          type: "string",
          required: true,
          defaultValue: "free",
          input: false,
        },
      },
    },

    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            // Public signup can never create an admin account.
            const role = user.role === "tutor" ? "tutor" : "student";

            return {
              data: {
                ...user,
                role,
                plan: "free",
              },
            };
          },
        },
      },
    },

    plugins: [jwt()],
  });
}
