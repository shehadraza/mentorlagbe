
import { Router } from "express";
import type { Db } from "mongodb";
import { createAuthMiddleware } from "../middleware/auth.middleware.js";

export function createAdminRouter(database: Db) {
  const router = Router();
  const auth = createAuthMiddleware(database);

  const users = database.collection("users");
  const tuitions = database.collection("tuitions");
  const payments = database.collection("payments");

  // Admin: Retrieve platform-wide dashboard statistics.
  router.get(
    "/statistics",
    auth.verifyToken,
    auth.verifyAdmin,
    async (_req, res) => {
      try {
        const userFilter = { _authModel: "user" };

        const [
          totalUsers,
          totalTutors,
          pendingTuitions,
          approvedTuitions,
          revenueResult,
        ] = await Promise.all([
          users.countDocuments(userFilter),

          users.countDocuments({
            ...userFilter,
            role: "tutor",
          }),

          tuitions.countDocuments({
            approvalStatus: "pending",
          }),

          tuitions.countDocuments({
            approvalStatus: "approved",
          }),

          payments
            .aggregate<{ totalRevenue: number }>([
              {
                $match: {
                  paymentStatus: "paid",
                },
              },
              {
                $group: {
                  _id: null,
                  totalRevenue: {
                    $sum: "$amount",
                  },
                },
              },
            ])
            .toArray(),
        ]);

        const totalRevenue = revenueResult[0]?.totalRevenue ?? 0;

        res.status(200).json({
          success: true,
          statistics: {
            totalUsers,
            totalTutors,
            pendingTuitions,
            approvedTuitions,
            totalRevenue,
            currency: "USD",
          },
        });
      } catch (error) {
        console.error("Admin statistics retrieval failed:", error);

        res.status(500).json({
          success: false,
          message: "Failed to retrieve platform statistics.",
        });
      }
    }
  );

  return router;
}
