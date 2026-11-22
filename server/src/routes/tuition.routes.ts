
import { Router } from "express";
import type { Db, Document } from "mongodb";
import { ObjectId } from "mongodb";
import { createAuthMiddleware } from "../middleware/auth.middleware.js";

type TuitionRecord = Document & {
  title: string;
  subject: string;
  classLevel: string;
  mode: string;
  location: string;
  monthlyFee: number;
  daysPerWeek: number;
  bannerImage: string;
  description: string;
  tutorName: string;
  tutorEmail: string;
  approvalStatus: "pending" | "approved" | "rejected";
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
};

const publicProjection = {
  title: 1,
  subject: 1,
  classLevel: 1,
  mode: 1,
  location: 1,
  monthlyFee: 1,
  daysPerWeek: 1,
  bannerImage: 1,
  description: 1,
  tutorName: 1,
  approvalStatus: 1,
  isActive: 1,
  createdAt: 1,
};

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function createTuitionRouter(database: Db) {
  const router = Router();
  const auth = createAuthMiddleware(database);
  const tuitions = database.collection<TuitionRecord>("tuitions");

  // Public: Search and filter approved active tuitions.
  router.get("/", async (req, res) => {
    try {
      const page = Number(req.query.page ?? 1);
      const limit = Number(req.query.limit ?? 10);

      if (
        !Number.isInteger(page) ||
        !Number.isInteger(limit) ||
        page < 1 ||
        limit < 1
      ) {
        res.status(400).json({
          success: false,
          message: "Invalid pagination parameters.",
        });
        return;
      }

      const filter: Document = {
        approvalStatus: "approved",
        isActive: true,
      };

      const search =
        typeof req.query.search === "string"
          ? req.query.search.trim()
          : "";

      if (search) {
        const pattern = new RegExp(escapeRegex(search), "i");
        filter.$or = [
          { title: pattern },
          { subject: pattern },
          { classLevel: pattern },
          { location: pattern },
          { tutorName: pattern },
        ];
      }

      for (const field of ["subject", "classLevel", "mode", "location"]) {
        const value = req.query[field];
        if (typeof value === "string" && value.trim()) {
          filter[field] =
            field === "mode"
              ? value.trim().toLowerCase()
              : { $regex: `^${escapeRegex(value.trim())}$`, $options: "i" };
        }
      }

      const minFee =
        req.query.minFee === undefined ? undefined : Number(req.query.minFee);
      const maxFee =
        req.query.maxFee === undefined ? undefined : Number(req.query.maxFee);

      if (
        (minFee !== undefined && (!Number.isFinite(minFee) || minFee < 0)) ||
        (maxFee !== undefined && (!Number.isFinite(maxFee) || maxFee < 0)) ||
        (minFee !== undefined &&
          maxFee !== undefined &&
          minFee > maxFee)
      ) {
        res.status(400).json({
          success: false,
          message: "Invalid tuition fee range.",
        });
        return;
      }

      if (minFee !== undefined || maxFee !== undefined) {
        filter.monthlyFee = {};
        if (minFee !== undefined) filter.monthlyFee.$gte = minFee;
        if (maxFee !== undefined) filter.monthlyFee.$lte = maxFee;
      }

      const safeLimit = Math.min(limit, 100);

      const [items, total] = await Promise.all([
        tuitions
          .find(filter, { projection: publicProjection })
          .sort({ createdAt: -1 })
          .skip((page - 1) * safeLimit)
          .limit(safeLimit)
          .toArray(),
        tuitions.countDocuments(filter),
      ]);

      res.status(200).json({
        success: true,
        tuitions: items,
        pagination: {
          currentPage: page,
          limit: safeLimit,
          total,
          totalPages: Math.ceil(total / safeLimit),
        },
      });
    } catch (error) {
      console.error("Public tuition listing failed:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve tuitions.",
      });
    }
  });

  // Tutor: Create a tuition post.
  router.post("/", auth.verifyToken, auth.verifyTutor, async (req, res) => {
    try {
      const user = res.locals.authUser;
      const {
        title,
        subject,
        classLevel,
        mode,
        location,
        monthlyFee,
        daysPerWeek,
        bannerImage,
        description,
      } = req.body ?? {};

      if (
        typeof title !== "string" ||
        !title.trim() ||
        title.length > 150 ||
        typeof subject !== "string" ||
        !subject.trim() ||
        typeof classLevel !== "string" ||
        !classLevel.trim() ||
        typeof mode !== "string" ||
        !["online", "offline"].includes(mode.toLowerCase()) ||
        typeof location !== "string" ||
        !location.trim() ||
        typeof description !== "string" ||
        !description.trim() ||
        description.length > 5000
      ) {
        res.status(400).json({
          success: false,
          message: "Please provide valid tuition details.",
        });
        return;
      }

      const fee = Number(monthlyFee);
      const days = Number(daysPerWeek);

      if (
        !Number.isFinite(fee) ||
        fee <= 0 ||
        !Number.isInteger(days) ||
        days < 1 ||
        days > 7
      ) {
        res.status(400).json({
          success: false,
          message: "Invalid monthly fee or days per week.",
        });
        return;
      }

      if (
        bannerImage !== undefined &&
        (typeof bannerImage !== "string" || bannerImage.length > 2000)
      ) {
        res.status(400).json({
          success: false,
          message: "Invalid banner image.",
        });
        return;
      }

      if (user.plan === "free") {
        const existingPosts = await tuitions.countDocuments({
          tutorEmail: user.email,
        });

        if (existingPosts >= 2) {
          res.status(403).json({
            success: false,
            message: "Free plan allows a maximum of two tuition posts. Upgrade to Pro for unlimited posts.",
          });
          return;
        }
      }

      const tuition: TuitionRecord = {
        title: title.trim(),
        subject: subject.trim(),
        classLevel: classLevel.trim(),
        mode: mode.toLowerCase(),
        location: location.trim(),
        monthlyFee: fee,
        daysPerWeek: days,
        bannerImage: bannerImage?.trim() ?? "",
        description: description.trim(),
        tutorName: user.name,
        tutorEmail: user.email,
        approvalStatus: "pending",
        isActive: true,
        createdAt: new Date(),
      };

      const result = await tuitions.insertOne(tuition);

      res.status(201).json({
        success: true,
        message: "Tuition submitted for admin approval.",
        tuition: { id: result.insertedId.toString(), ...tuition },
      });
    } catch (error) {
      console.error("Tuition creation failed:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create tuition.",
      });
    }
  });

  // Tutor: View own tuition posts.
  router.get("/mine", auth.verifyToken, auth.verifyTutor, async (_req, res) => {
    try {
      const user = res.locals.authUser;
      const items = await tuitions
        .find({ tutorEmail: user.email })
        .sort({ createdAt: -1 })
        .toArray();

      res.status(200).json({
        success: true,
        tuitions: items,
        total: items.length,
      });
    } catch (error) {
      console.error("Tutor tuition listing failed:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve your tuitions.",
      });
    }
  });

  // Admin: View pending tuition posts.
  router.get(
    "/admin/pending",
    auth.verifyToken,
    auth.verifyAdmin,
    async (_req, res) => {
      try {
        const items = await tuitions
          .find({ approvalStatus: "pending" })
          .sort({ createdAt: -1 })
          .toArray();

        res.status(200).json({
          success: true,
          tuitions: items,
          total: items.length,
        });
      } catch (error) {
        console.error("Pending tuition listing failed:", error);
        res.status(500).json({
          success: false,
          message: "Failed to retrieve pending tuitions.",
        });
      }
    }
  );

  // Admin: Approve or reject tuition.
    // Admin: Approve or reject pending tuition only.
  router.patch(
    "/:id/moderate",
    auth.verifyToken,
    auth.verifyAdmin,
    async (req, res) => {
      try {
        const id = req.params.id;
        const approvalStatus: unknown = req.body?.approvalStatus;

        if (
          typeof id !== "string" ||
          !ObjectId.isValid(id) ||
          (approvalStatus !== "approved" &&
            approvalStatus !== "rejected")
        ) {
          res.status(400).json({
            success: false,
            message: "Invalid tuition ID or approval status.",
          });
          return;
        }

        // Only a pending submission can be moderated.
        const result = await tuitions.updateOne(
          {
            _id: new ObjectId(id),
            approvalStatus: "pending",
          },
          {
            $set: {
              approvalStatus,
              updatedAt: new Date(),
            },
          }
        );

        if (result.matchedCount === 0) {
          const existingTuition = await tuitions.findOne(
            { _id: new ObjectId(id) },
            { projection: { _id: 1, approvalStatus: 1 } }
          );

          if (!existingTuition) {
            res.status(404).json({
              success: false,
              message: "Tuition not found.",
            });
            return;
          }

          res.status(409).json({
            success: false,
            message: "This tuition has already been reviewed.",
          });
          return;
        }

        res.status(200).json({
          success: true,
          message: `Tuition ${approvalStatus} successfully.`,
        });
      } catch (error) {
        console.error("Tuition moderation failed:", error);

        res.status(500).json({
          success: false,
          message: "Failed to moderate tuition.",
        });
      }
    }
  );

  // Tutor: Edit own tuition. Editing sends it back for approval.
  router.patch(
    "/:id",
    auth.verifyToken,
    auth.verifyTutor,
    async (req, res) => {
      try {
        const id = req.params.id;

        if (typeof id !== "string" || !ObjectId.isValid(id)) {
          res.status(400).json({
            success: false,
            message: "Invalid tuition ID.",
          });
          return;
        }

        const user = res.locals.authUser;
        const allowedFields = [
          "title",
          "subject",
          "classLevel",
          "mode",
          "location",
          "monthlyFee",
          "daysPerWeek",
          "bannerImage",
          "description",
        ];

        const updates: Document = {};

        for (const field of allowedFields) {
          if (req.body?.[field] !== undefined) {
            updates[field] = req.body[field];
          }
        }

        if (Object.keys(updates).length === 0) {
          res.status(400).json({
            success: false,
            message: "No valid fields provided for update.",
          });
          return;
        }

        if (
          updates.title !== undefined &&
          (typeof updates.title !== "string" ||
            !updates.title.trim() ||
            updates.title.length > 150)
        ) {
          res.status(400).json({ success: false, message: "Invalid title." });
          return;
        }

        if (
          updates.subject !== undefined &&
          (typeof updates.subject !== "string" || !updates.subject.trim())
        ) {
          res.status(400).json({ success: false, message: "Invalid subject." });
          return;
        }

        if (
          updates.classLevel !== undefined &&
          (typeof updates.classLevel !== "string" ||
            !updates.classLevel.trim())
        ) {
          res.status(400).json({ success: false, message: "Invalid class level." });
          return;
        }

        if (
          updates.mode !== undefined &&
          (typeof updates.mode !== "string" ||
            !["online", "offline"].includes(updates.mode.toLowerCase()))
        ) {
          res.status(400).json({ success: false, message: "Invalid mode." });
          return;
        }

        if (
          updates.location !== undefined &&
          (typeof updates.location !== "string" || !updates.location.trim())
        ) {
          res.status(400).json({ success: false, message: "Invalid location." });
          return;
        }

        if (
          updates.description !== undefined &&
          (typeof updates.description !== "string" ||
            !updates.description.trim() ||
            updates.description.length > 5000)
        ) {
          res.status(400).json({ success: false, message: "Invalid description." });
          return;
        }

        if (
          updates.monthlyFee !== undefined &&
          (!Number.isFinite(Number(updates.monthlyFee)) ||
            Number(updates.monthlyFee) <= 0)
        ) {
          res.status(400).json({ success: false, message: "Invalid monthly fee." });
          return;
        }

        if (
          updates.daysPerWeek !== undefined &&
          (!Number.isInteger(Number(updates.daysPerWeek)) ||
            Number(updates.daysPerWeek) < 1 ||
            Number(updates.daysPerWeek) > 7)
        ) {
          res.status(400).json({ success: false, message: "Invalid days per week." });
          return;
        }

        if (
          updates.bannerImage !== undefined &&
          (typeof updates.bannerImage !== "string" ||
            updates.bannerImage.length > 2000)
        ) {
          res.status(400).json({ success: false, message: "Invalid banner image." });
          return;
        }

        if (updates.monthlyFee !== undefined) {
          updates.monthlyFee = Number(updates.monthlyFee);
        }
        if (updates.daysPerWeek !== undefined) {
          updates.daysPerWeek = Number(updates.daysPerWeek);
        }
        if (updates.mode !== undefined) {
          updates.mode = updates.mode.toLowerCase();
        }
        for (const field of ["title", "subject", "classLevel", "location", "description", "bannerImage"]) {
          if (typeof updates[field] === "string") {
            updates[field] = updates[field].trim();
          }
        }

        const result = await tuitions.updateOne(
          { _id: new ObjectId(id), tutorEmail: user.email },
          {
            $set: {
              ...updates,
              approvalStatus: "pending",
              updatedAt: new Date(),
            },
          }
        );

        if (!result.matchedCount) {
          res.status(404).json({
            success: false,
            message: "Tuition not found or you do not own this tuition.",
          });
          return;
        }

        res.status(200).json({
          success: true,
          message: "Tuition updated and sent for admin approval.",
        });
      } catch (error) {
        console.error("Tuition update failed:", error);
        res.status(500).json({
          success: false,
          message: "Failed to update tuition.",
        });
      }
    }
  );

  // Tutor: Deactivate own tuition post.
  router.patch(
    "/:id/deactivate",
    auth.verifyToken,
    auth.verifyTutor,
    async (req, res) => {
      try {
        const id = req.params.id;

        if (typeof id !== "string" || !ObjectId.isValid(id)) {
          res.status(400).json({
            success: false,
            message: "Invalid tuition ID.",
          });
          return;
        }

        const user = res.locals.authUser;
        const result = await tuitions.updateOne(
          { _id: new ObjectId(id), tutorEmail: user.email },
          { $set: { isActive: false, updatedAt: new Date() } }
        );

        if (!result.matchedCount) {
          res.status(404).json({
            success: false,
            message: "Tuition not found or you do not own this tuition.",
          });
          return;
        }

        res.status(200).json({
          success: true,
          message: "Tuition deactivated successfully.",
        });
      } catch (error) {
        console.error("Tuition deactivation failed:", error);
        res.status(500).json({
          success: false,
          message: "Failed to deactivate tuition.",
        });
      }
    }
  );

  // Public: View one approved active tuition.
  router.get("/:id", async (req, res) => {
    try {
      const id = req.params.id;

      if (typeof id !== "string" || !ObjectId.isValid(id)) {
        res.status(400).json({
          success: false,
          message: "Invalid tuition ID.",
        });
        return;
      }

      const tuition = await tuitions.findOne(
        {
          _id: new ObjectId(id),
          approvalStatus: "approved",
          isActive: true,
        },
        { projection: publicProjection }
      );

      if (!tuition) {
        res.status(404).json({
          success: false,
          message: "Tuition not found.",
        });
        return;
      }

      res.status(200).json({ success: true, tuition });
    } catch (error) {
      console.error("Tuition details failed:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve tuition details.",
      });
    }
  });

  return router;
}
