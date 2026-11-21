
import type { RequestHandler } from "express";
import type { Db, Document } from "mongodb";
import { createRemoteJWKSet, jwtVerify } from "jose";

type UserRecord = Document & {
  _id: string;
  _authModel: "user";
  name: string;
  email: string;
  role: "student" | "tutor" | "admin";
  plan: "free" | "pro";
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "student" | "tutor" | "admin";
  plan: "free" | "pro";
};

export function createAuthMiddleware(database: Db) {
  const baseURL =
    process.env.BETTER_AUTH_URL || "http://localhost:5000";

  const jwksURL = new URL("/api/auth/jwks", baseURL);
  const JWKS = createRemoteJWKSet(jwksURL);

  const verifyToken: RequestHandler = async (req, res, next) => {
    try {
      const authorization = req.headers.authorization;

      if (!authorization?.startsWith("Bearer ")) {
        res.status(401).json({
          success: false,
          message: "Authentication token is required.",
        });
        return;
      }

      const token = authorization.slice(7).trim();

      if (!token) {
        res.status(401).json({
          success: false,
          message: "Authentication token is missing.",
        });
        return;
      }

      const { payload } = await jwtVerify(token, JWKS, {
        issuer: baseURL,
        audience: baseURL,
      });

      if (!payload.sub) {
        res.status(401).json({
          success: false,
          message: "Invalid authentication token.",
        });
        return;
      }

      const users = database.collection<UserRecord>("users");

      const user = await users.findOne({
        _id: payload.sub,
        _authModel: "user",
      });

      if (!user) {
        res.status(401).json({
          success: false,
          message: "User account not found.",
        });
        return;
      }

      if (
        !["student", "tutor", "admin"].includes(user.role) ||
        !["free", "pro"].includes(user.plan)
      ) {
        res.status(403).json({
          success: false,
          message: "Invalid account permissions.",
        });
        return;
      }

      res.locals.authUser = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
      } satisfies AuthUser;

      next();
    } catch (error) {
      console.error("JWT verification failed:", error);

      res.status(401).json({
        success: false,
        message: "Invalid or expired authentication token.",
      });
    }
  };

  const requireRole = (...allowedRoles: AuthUser["role"][]): RequestHandler => {
    return (_req, res, next) => {
      const user = res.locals.authUser as AuthUser | undefined;

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
        return;
      }

      if (!allowedRoles.includes(user.role)) {
        res.status(403).json({
          success: false,
          message: "You do not have permission to access this resource.",
        });
        return;
      }

      next();
    };
  };

  return {
    verifyToken,
    verifyStudent: requireRole("student"),
    verifyTutor: requireRole("tutor"),
    verifyAdmin: requireRole("admin"),
  };
}
