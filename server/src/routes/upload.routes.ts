
import { Router } from "express";
import multer from "multer";
import { createAuthMiddleware } from "../middleware/auth.middleware.js";
import type { Db } from "mongodb";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
});

function isValidImage(buffer: Buffer, mimeType: string): boolean {
  if (mimeType === "image/jpeg") {
    return (
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff
    );
  }

  if (mimeType === "image/png") {
    return (
      buffer.length >= 8 &&
      buffer.subarray(0, 8).equals(
        Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
      )
    );
  }

  if (mimeType === "image/webp") {
    return (
      buffer.length >= 12 &&
      buffer.toString("ascii", 0, 4) === "RIFF" &&
      buffer.toString("ascii", 8, 12) === "WEBP"
    );
  }

  return false;
}

export function createUploadRouter(database: Db) {
  const router = Router();
  const auth = createAuthMiddleware(database);

  router.post(
    "/image",
    auth.verifyToken,
    (req, res, next) => {
      upload.single("image")(req, res, (error) => {
        if (error instanceof multer.MulterError) {
          if (error.code === "LIMIT_FILE_SIZE") {
            res.status(413).json({
              success: false,
              message: "Image size must not exceed 5 MB.",
            });
            return;
          }

          res.status(400).json({
            success: false,
            message: "Invalid image upload request.",
          });
          return;
        }

        if (error) {
          res.status(400).json({
            success: false,
            message: "Image upload failed.",
          });
          return;
        }

        next();
      });
    },
    async (req, res) => {
      try {
        const file = req.file;

        if (!file) {
          res.status(400).json({
            success: false,
            message: "Please select an image to upload.",
          });
          return;
        }

        if (!allowedMimeTypes.includes(file.mimetype)) {
          res.status(415).json({
            success: false,
            message: "Only JPG, PNG and WEBP images are allowed.",
          });
          return;
        }

        if (!isValidImage(file.buffer, file.mimetype)) {
          res.status(415).json({
            success: false,
            message: "The uploaded file is not a valid image.",
          });
          return;
        }

        const apiKey = process.env.IMGBB_API_KEY;

        if (!apiKey) {
          res.status(503).json({
            success: false,
            message: "Image upload service is not configured.",
          });
          return;
        }

        const formData = new URLSearchParams();
        formData.append("image", file.buffer.toString("base64"));

        const response = await fetch(
          `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
          {
            method: "POST",
            body: formData,
          }
        );

        const result = (await response.json()) as {
          success?: boolean;
          data?: {
            url?: string;
            display_url?: string;
          };
          error?: {
            message?: string;
          };
        };

        if (!response.ok || !result.success || !result.data?.url) {
          console.error("ImgBB upload rejected:", result.error?.message);

          res.status(502).json({
            success: false,
            message: "Image hosting service could not upload the image.",
          });
          return;
        }

        res.status(201).json({
          success: true,
          message: "Image uploaded successfully.",
          image: {
            url: result.data.url,
            displayUrl: result.data.display_url ?? result.data.url,
          },
        });
      } catch (error) {
        console.error("Image upload failed:", error);

        res.status(500).json({
          success: false,
          message: "Failed to upload image.",
        });
      }
    }
  );

  return router;
}
