
import { Router } from "express";
import type { Db, Document } from "mongodb";
import { createAuthMiddleware } from "../middleware/auth.middleware.js";
import type { AuthUser } from "../middleware/auth.middleware.js";

type UserRole = "student" | "tutor" | "admin";
type ThemePreference = "light" | "dark" | "system";
type LanguagePreference = "en" | "bn";
type ProfileVisibility = "public" | "private";

type UserSettings = {
  appearance: {
    theme: ThemePreference;
    language: LanguagePreference;
  };
  notifications: {
    email: boolean;
    applicationUpdates: boolean;
    tuitionAlerts: boolean;
    marketing: boolean;
  };
  privacy: {
    profileVisibility: ProfileVisibility;
  };
};

type UserRecord = Document & {
  _id: string;
  _authModel: "user";
  name?: string;
  email?: string;
  role?: UserRole;
  phone?: string;
  bio?: string;
  image?: string;
  plan?: "free" | "pro";
  settings?: UserSettings;
  createdAt?: Date;
  updatedAt?: Date;
};

const allowedRoles: UserRole[] = ["student", "tutor", "admin"];

const defaultSettings: UserSettings = {
  appearance: {
    theme: "light",
    language: "en",
  },
  notifications: {
    email: true,
    applicationUpdates: true,
    tuitionAlerts: true,
    marketing: false,
  },
  privacy: {
    profileVisibility: "public",
  },
};

function isObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isValidSettings(value: unknown): value is UserSettings {
  if (!isObject(value)) return false;

  const appearance = value.appearance;
  const notifications = value.notifications;
  const privacy = value.privacy;

  if (
    !isObject(appearance) ||
    !isObject(notifications) ||
    !isObject(privacy)
  ) {
    return false;
  }

  return (
    ["light", "dark", "system"].includes(
      appearance.theme as string,
    ) &&
    ["en", "bn"].includes(appearance.language as string) &&
    typeof notifications.email === "boolean" &&
    typeof notifications.applicationUpdates === "boolean" &&
    typeof notifications.tuitionAlerts === "boolean" &&
    typeof notifications.marketing === "boolean" &&
    ["public", "private"].includes(
      privacy.profileVisibility as string,
    )
  );
}

export function createUserRouter(database: Db) {
  const router = Router();
  const auth = createAuthMiddleware(database);

  const usersCollection =
    database.collection<UserRecord>("users");

  // Authenticated user: retrieve their own settings.
  router.get(
    "/me/settings",
    auth.verifyToken,
    async (_req, res) => {
      try {
        const currentUser = res.locals.authUser as
          | AuthUser
          | undefined;

        if (!currentUser) {
          res.status(401).json({
            success: false,
            message: "Authentication required.",
          });
          return;
        }

        const user = await usersCollection.findOne(
          {
            _id: currentUser.id,
            _authModel: "user",
          },
          {
            projection: {
              settings: 1,
            },
          },
        );

        if (!user) {
          res.status(404).json({
            success: false,
            message: "User account not found.",
          });
          return;
        }

        res.status(200).json({
          success: true,
          settings: user.settings ?? defaultSettings,
        });
      } catch (error) {
        console.error("User settings retrieval failed:", error);

        res.status(500).json({
          success: false,
          message: "Failed to retrieve settings.",
        });
      }
    },
  );

  // Authenticated user: update only their own preferences.
  router.patch(
    "/me/settings",
    auth.verifyToken,
    async (req, res) => {
      try {
        const currentUser = res.locals.authUser as
          | AuthUser
          | undefined;

        if (!currentUser) {
          res.status(401).json({
            success: false,
            message: "Authentication required.",
          });
          return;
        }

        const body = req.body as
          | { settings?: unknown }
          | undefined;

        const requestedSettings = body?.settings;

        if (!isValidSettings(requestedSettings)) {
          res.status(400).json({
            success: false,
            message: "Invalid settings data.",
          });
          return;
        }

        const result = await usersCollection.updateOne(
          {
            _id: currentUser.id,
            _authModel: "user",
          },
          {
            $set: {
              settings: requestedSettings,
              updatedAt: new Date(),
            },
          },
        );

        if (result.matchedCount === 0) {
          res.status(404).json({
            success: false,
            message: "User account not found.",
          });
          return;
        }

        res.status(200).json({
          success: true,
          message: "Settings saved successfully.",
          settings: requestedSettings,
        });
      } catch (error) {
        console.error("User settings update failed:", error);

        res.status(500).json({
          success: false,
          message: "Failed to save settings.",
        });
      }
    },
  );

  // Authenticated user: retrieve their own profile.
  router.get(
    "/me/profile",
    auth.verifyToken,
    async (_req, res) => {
      try {
        const currentUser = res.locals.authUser as AuthUser | undefined;

        if (!currentUser) {
          res.status(401).json({
            success: false,
            message: "Authentication required.",
          });
          return;
        }

        const user = await usersCollection.findOne(
          {
            _id: currentUser.id,
            _authModel: "user",
          },
          {
            projection: {
              name: 1,
              email: 1,
              role: 1,
              plan: 1,
              phone: 1,
              bio: 1,
              image: 1,
            },
          },
        );

        if (!user) {
          res.status(404).json({
            success: false,
            message: "User account not found.",
          });
          return;
        }

        res.status(200).json({
          success: true,
          profile: {
            name: user.name ?? "",
            email: user.email ?? "",
            role: user.role ?? "student",
            plan: user.plan ?? "free",
            phone: user.phone ?? "",
            bio: user.bio ?? "",
            image: user.image ?? null,
          },
        });
      } catch (error) {
        console.error("Profile retrieval failed:", error);

        res.status(500).json({
          success: false,
          message: "Failed to retrieve profile.",
        });
      }
    },
  );

  // Authenticated user: update only their own profile.
  router.patch(
    "/me/profile",
    auth.verifyToken,
    async (req, res) => {
      try {
        const currentUser = res.locals.authUser as AuthUser | undefined;

        if (!currentUser) {
          res.status(401).json({
            success: false,
            message: "Authentication required.",
          });
          return;
        }

        const body = req.body as {
          name?: unknown;
          phone?: unknown;
          bio?: unknown;
          image?: unknown;
        };

        const name =
          typeof body.name === "string" ? body.name.trim() : "";

        const phone =
          typeof body.phone === "string" ? body.phone.trim() : "";

        const bio =
          typeof body.bio === "string" ? body.bio.trim() : "";

        if (name.length < 2 || name.length > 80) {
          res.status(400).json({
            success: false,
            message: "Name must be between 2 and 80 characters.",
          });
          return;
        }

        if (phone.length > 25) {
          res.status(400).json({
            success: false,
            message: "Phone number is too long.",
          });
          return;
        }

        if (bio.length > 300) {
          res.status(400).json({
            success: false,
            message: "Bio cannot exceed 300 characters.",
          });
          return;
        }

        if (
          body.image !== undefined &&
          body.image !== null &&
          (
            typeof body.image !== "string" ||
            body.image.length > 60000 ||
            !/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(
              body.image,
            )
          )
        ) {
          res.status(400).json({
            success: false,
            message: "Invalid profile image. Use a compressed JPEG, PNG, or WebP image.",
          });
          return;
        }

        const update: {
          $set: Record<string, unknown>;
          $unset?: Record<string, "">;
        } = {
          $set: {
            name,
            phone,
            bio,
            updatedAt: new Date(),
          },
        };

        if (typeof body.image === "string") {
          update.$set.image = body.image;
        } else if (body.image === null) {
          update.$unset = { image: "" };
        }

        const result = await usersCollection.updateOne(
          {
            _id: currentUser.id,
            _authModel: "user",
          },
          update,
        );

        if (result.matchedCount === 0) {
          res.status(404).json({
            success: false,
            message: "User account not found.",
          });
          return;
        }

        res.status(200).json({
          success: true,
          message: "Profile updated successfully.",
          profile: {
            name,
            email: currentUser.email,
            role: currentUser.role,
            plan: currentUser.plan,
            phone,
            bio,
            image:
              typeof body.image === "string"
                ? body.image
                : body.image === null
                  ? null
                  : undefined,
          },
        });
      } catch (error) {
        console.error("Profile update failed:", error);

        res.status(500).json({
          success: false,
          message: "Failed to update profile.",
        });
      }
    },
  );
  // Admin: View all registered users with filtering and pagination.
  router.get(
    "/",
    auth.verifyToken,
    auth.verifyAdmin,
    async (req, res) => {
      try {
        const role =
          typeof req.query.role === "string"
            ? req.query.role
            : undefined;

        if (role && !allowedRoles.includes(role as UserRole)) {
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
    },
  );

  // Admin: Update a registered user's role.


  return router;
}
