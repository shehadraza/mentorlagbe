
import { Router } from "express";
import type { Db, Document } from "mongodb";
import { createAuthMiddleware } from "../middleware/auth.middleware.js";

type UserRecord = Document & {
  _id: string;
  _authModel: "user";
  name?: string;
  email?: string;
  role?: "student" | "tutor" | "admin";
  phone?: string;
  bio?: string;
  plan?: "free" | "pro";
  createdAt?: Date;
};

export function createUserRouter(database: Db) {
  const router = Router();
  const auth = createAuthMiddleware(database);

  // Admin: View all registered users with filtering and pagination.
  router.get(
    "/",
    auth.verifyToken,
    auth.verifyAdmin,
    async (req, res) => {
      try {
        const allowedRoles = ["student", "tutor", "admin"];

        const role =
          typeof req.query.role === "string"
            ? req.query.role
            : undefined;

        if (role && !allowedRoles.includes(role)) {
          res.status(400).json({
            success: false,
            message: "Invalid user role filter.",
          });
          return;
        }

        const pageValue =
          typeof req.query.page === "string"
            ? Number.parseInt(req.query.page, 10)
            : 1;

        const limitValue =
          typeof req.query.limit === "string"
            ? Number.parseInt(req.query.limit, 10)
            : 10;

        if (
          !Number.isInteger(pageValue) ||
          !Number.isInteger(limitValue) ||
          pageValue < 1 ||
          limitValue < 1
        ) {
          res.status(400).json({
            success: false,
            message: "Invalid pagination parameters.",
          });
          return;
        }

        const page = pageValue;
        const limit = Math.min(limitValue, 100);
        const skip = (page - 1) * limit;

        const filter: Document = {
          _authModel: "user",
        };

        if (role) {
          filter.role = role;
        }

        const usersCollection =
          database.collection<UserRecord>("users");

        const [users, totalUsers] = await Promise.all([
          usersCollection
            .find(filter, {
              projection: {
                _id: 1,
                name: 1,
                email: 1,
                role: 1,
                phone: 1,
                bio: 1,
                plan: 1,
                createdAt: 1,
              },
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .toArray(),

          usersCollection.countDocuments(filter),
        ]);

        res.status(200).json({
          success: true,
          users: users.map((user) => ({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            bio: user.bio,
            plan: user.plan,
            createdAt: user.createdAt,
          })),
          pagination: {
            currentPage: page,
            limit,
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
          },
        });
      } catch (error) {
        console.error("Admin user listing failed:", error);

        res.status(500).json({
          success: false,
          message: "Failed to retrieve users.",
        });
      }
    }
  );

  return router;
}
