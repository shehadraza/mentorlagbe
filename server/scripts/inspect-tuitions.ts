
import "dotenv/config";
import { MongoClient } from "mongodb";
import { setServers } from "node:dns";

setServers(["1.1.1.1", "8.8.8.8"]);

async function inspectDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is missing from server/.env");
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();

    const database = client.db("mentorlagbe");
    const tuitions = database.collection("tuitions");
    const users = database.collection("users");

    console.log("\n========== TUITION SUMMARY ==========\n");

    const totalTuitions = await tuitions.countDocuments();

    console.log("Total tuition records:", totalTuitions);

    const statusSummary = await tuitions
      .aggregate([
        {
          $group: {
            _id: {
              approvalStatus: "$approvalStatus",
              isActive: "$isActive",
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.approvalStatus": 1 } },
      ])
      .toArray();

    console.log("\nApproval status breakdown:");
    console.table(
      statusSummary.map((item) => ({
        approvalStatus: item._id.approvalStatus ?? "missing",
        isActive: item._id.isActive ?? "missing",
        count: item.count,
      }))
    );

    const existingTuitions = await tuitions
      .find(
        {},
        {
          projection: {
            title: 1,
            subject: 1,
            tutorName: 1,
            approvalStatus: 1,
            isActive: 1,
          },
        }
      )
      .toArray();

    console.log("\nExisting tuition records:");
    console.table(
      existingTuitions.map((item) => ({
        title: item.title,
        subject: item.subject,
        tutorName: item.tutorName,
        approvalStatus: item.approvalStatus,
        isActive: item.isActive,
      }))
    );

    console.log("\n========== TUTOR ACCOUNTS ==========\n");

    const tutorAccounts = await users
      .find(
        { _authModel: "user", role: "tutor" },
        {
          projection: {
            name: 1,
            role: 1,
            plan: 1,
          },
        }
      )
      .toArray();

    console.log("Tutor account count:", tutorAccounts.length);

    console.table(
      tutorAccounts.map((user) => ({
        name: user.name,
        role: user.role,
        plan: user.plan ?? "free",
      }))
    );

    console.log("\nInspection completed. No database records were modified.");
  } finally {
    await client.close();
  }
}

inspectDatabase().catch((error) => {
  console.error("Database inspection failed:", error);
  process.exitCode = 1;
});
