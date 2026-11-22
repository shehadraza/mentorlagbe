
import { Router } from "express";
import type { Db, Document } from "mongodb";
import { ObjectId } from "mongodb";
import { createAuthMiddleware } from "../middleware/auth.middleware.js";

type TuitionRecord = Document & {
  title: string;
  subject: string;
  monthlyFee: number;
  tutorName: string;
  tutorEmail: string;
  approvalStatus: "pending" | "approved" | "rejected";
  isActive: boolean;
};

type ApplicationRecord = Document & {
  tuitionId: string;
  tuitionTitle: string;
  subject: string;
  monthlyFee: number;
  tutorEmail: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  preferredSchedule: string;
  studentNote: string;
  status: "pending" | "accepted" | "rejected";
  appliedAt: Date;
  updatedAt?: Date;
};

export function createApplicationRouter(database: Db) {
  const router = Router();
  const auth = createAuthMiddleware(database);

  const applications =
    database.collection<ApplicationRecord>("applications");

  const tuitions =
    database.collection<TuitionRecord>("tuitions");

  // Prevent duplicate applications, including simultaneous requests.
  void applications
    .createIndex(
      { tuitionId: 1, studentEmail: 1 },
      { unique: true, name: "unique_student_tuition_application" }
    )
    .catch((error) => {
      console.error("Application index creation failed:", error);
    });

  // Student: Apply to an approved and active tuition.
  router.post("/", auth.verifyToken, auth.verifyStudent, async (req, res) => {
    try {
      const user = res.locals.authUser;
      const {
        tuitionId,
        preferredSchedule = "",
        studentNote = "",
        studentPhone = "",
      } = req.body ?? {};

      if (
        typeof tuitionId !== "string" ||
        !ObjectId.isValid(tuitionId)
      ) {
        res.status(400).json({
          success: false,
          message: "A valid tuition ID is required.",
        });
        return;
      }

      if (
        typeof preferredSchedule !== "string" ||
        typeof studentNote !== "string" ||
        typeof studentPhone !== "string"
      ) {
        res.status(400).json({
          success: false,
          message: "Invalid application details.",
        });
        return;
      }

      if (studentNote.length > 2000 || preferredSchedule.length > 300) {
        res.status(400).json({
          success: false,
          message: "Application details exceed the allowed length.",
        });
        return;
      }

      const tuition = await tuitions.findOne({
        _id: new ObjectId(tuitionId),
        approvalStatus: "approved",
        isActive: true,
      });

      if (!tuition) {
        res.status(404).json({
          success: false,
          message: "This tuition is unavailable for applications.",
        });
        return;
      }

      const existing = await applications.findOne({
        tuitionId,
        studentEmail: user.email,
      });

      if (existing) {
        res.status(409).json({
          success: false,
          message: "You have already applied to this tuition.",
        });
        return;
      }

      const userRecord = await database.collection("users").findOne({
        _id: user.id,
        _authModel: "user",
      });

      const application: ApplicationRecord = {
        tuitionId,
        tuitionTitle: tuition.title,
        subject: tuition.subject,
        monthlyFee: tuition.monthlyFee,
        tutorEmail: tuition.tutorEmail,
        studentName: user.name,
        studentEmail: user.email,
        studentPhone:
          studentPhone.trim() ||
          (typeof userRecord?.phone === "string"
            ? userRecord.phone
            : ""),
        preferredSchedule: preferredSchedule.trim(),
        studentNote: studentNote.trim(),
        status: "pending",
        appliedAt: new Date(),
      };

      const result = await applications.insertOne(application);

      res.status(201).json({
        success: true,
        message: "Your application has been submitted successfully.",
        application: {
          id: result.insertedId.toString(),
          ...application,
        },
      });
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === 11000
      ) {
        res.status(409).json({
          success: false,
          message: "You have already applied to this tuition.",
        });
        return;
      }

      console.error("Student application failed:", error);
      res.status(500).json({
        success: false,
        message: "Failed to submit your application.",
      });
    }
  });

  // Student: View their own applications.
  
  // Student: View their own applications.
  router.get("/mine", auth.verifyToken, auth.verifyStudent, async (_req, res) => {
    try {
      const user = res.locals.authUser;

      const items = await applications
        .find({ studentEmail: user.email })
        .sort({ appliedAt: -1 })
        .toArray();

      // Fetch tutor names for all related tuition records in one query.
      const tuitionIds = [
        ...new Set(
          items
            .map((item) => item.tuitionId)
            .filter((id) => ObjectId.isValid(id))
        ),
      ].map((id) => new ObjectId(id));

      const relatedTuitions =
        tuitionIds.length > 0
          ? await tuitions
              .find(
                { _id: { $in: tuitionIds } },
                { projection: { tutorName: 1 } }
              )
              .toArray()
          : [];

      const tutorNames = new Map(
        relatedTuitions.map((tuition) => [
          tuition._id.toString(),
          tuition.tutorName,
        ])
      );

      const enrichedItems = items.map((item) => ({
        ...item,
        tutorName: tutorNames.get(item.tuitionId) || "Tutor",
      }));

      res.status(200).json({
        success: true,
        applications: enrichedItems,
        total: enrichedItems.length,
      });
    } catch (error) {
      console.error("Student application listing failed:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve your applications.",
      });
    }
  });
      // Student: Cancel a pending application.
  router.delete(
    "/:id",
    auth.verifyToken,
    auth.verifyStudent,
    async (req, res) => {
      try {
        const user = res.locals.authUser;
        const id = req.params.id;

        if (typeof id !== "string" || !ObjectId.isValid(id)) {
          res.status(400).json({
            success: false,
            message: "Invalid application ID.",
          });
          return;
        }

        const applicationId = new ObjectId(id);

        const result = await applications.deleteOne({
          _id: applicationId,
          studentEmail: user.email,
          status: "pending",
        });

        if (result.deletedCount === 0) {
          const existing = await applications.findOne(
            {
              _id: applicationId,
              studentEmail: user.email,
            },
            { projection: { status: 1 } }
          );

          if (!existing) {
            res.status(404).json({
              success: false,
              message: "Application not found.",
            });
            return;
          }

          res.status(409).json({
            success: false,
            message: "Only pending applications can be cancelled.",
          });
          return;
        }

        res.status(200).json({
          success: true,
          message: "Application cancelled successfully.",
        });
      } catch (error) {
        console.error("Student application cancellation failed:", error);
        res.status(500).json({
          success: false,
          message: "Failed to cancel your application.",
        });
      }
    }
  );

  // Tutor: View applications for their own tuition posts.
  router.get("/tutor", auth.verifyToken, auth.verifyTutor, async (_req, res) => {
    try {
      const user = res.locals.authUser;

      const items = await applications
        .find({ tutorEmail: user.email })
        .sort({ appliedAt: -1 })
        .toArray();

      res.status(200).json({
        success: true,
        applications: items,
        total: items.length,
      });
    } catch (error) {
      console.error("Tutor applicant listing failed:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve applicants.",
      });
    }
  });

  // Tutor: Accept or reject an application for their own tuition.
  router.patch(
    "/:id/status",
    auth.verifyToken,
    auth.verifyTutor,
    async (req, res) => {
      try {
        const user = res.locals.authUser;
        const id = req.params.id;
        const { status } = req.body ?? {};

        if (
          typeof id !== "string" ||
          !ObjectId.isValid(id) ||
          !["accepted", "rejected"].includes(status)
        ) {
          res.status(400).json({
            success: false,
            message: "Invalid application ID or status.",
          });
          return;
        }

        const result = await applications.updateOne(
          {
            _id: new ObjectId(id),
            tutorEmail: user.email,
          },
          {
            $set: {
              status,
              updatedAt: new Date(),
            },
          }
        );

        if (result.matchedCount === 0) {
          res.status(404).json({
            success: false,
            message: "Application not found for your tuition posts.",
          });
          return;
        }

        res.status(200).json({
          success: true,
          message: `Application ${status} successfully.`,
        });
      } catch (error) {
        console.error("Application status update failed:", error);
        res.status(500).json({
          success: false,
          message: "Failed to update application status.",
        });
      }
    }
  );

  // Admin: View all applications.
  router.get("/admin", auth.verifyToken, auth.verifyAdmin, async (req, res) => {
    try {
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

      const [items, total] = await Promise.all([
        applications
          .find({})
          .sort({ appliedAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .toArray(),
        applications.countDocuments({}),
      ]);

      res.status(200).json({
        success: true,
        applications: items,
        pagination: {
          currentPage: page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Admin application listing failed:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve applications.",
      });
    }
  });

  return router;
}
