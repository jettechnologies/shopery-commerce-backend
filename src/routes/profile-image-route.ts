import { Router } from "express";
import { authGuard, AuthRequest } from "@/middlewares/auth.middleware";
import {
  handleMulterError,
  uploadSingle,
} from "@/middlewares/multer.middleware";
import { BadRequestError, UnauthorizedError } from "@/libs/AppError";
import { ProfileImageService } from "@/services/profile-image-service";
import ApiResponse from "@/libs/ApiResponse";
import { handleError } from "@/libs/misc";

const profileRouter = Router();
profileRouter.use(authGuard, handleMulterError);

/**
 * @swagger
 * tags:
 *   name: Categories (Admin)
 *   description: Category management routes for administrators
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ProfileImage:
 *       type: object
 *       properties:
 *         imageUrl:
 *           type: string
 *           example: "https://res.cloudinary.com/demo/image/upload/v123/profile.jpg"
 *         publicId:
 *           type: string
 *           example: "profile/abc123"
 */

/**
 * @swagger
 * /profile/image/upload:
 *   post:
 *     summary: Upload or update user profile image
 *     description: Upload a new profile image. Replaces existing image if present.
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Profile image uploaded"
 *                 data:
 *                   $ref: '#/components/schemas/ProfileImage'
 *       400:
 *         description: Invalid file or upload error
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /profile/image/delete:
 *   delete:
 *     summary: Delete user profile image
 *     description: Removes the current user's profile image from storage.
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile image deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Profile image deleted successfully"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No profile image found
 */

profileRouter.post(
  "/image/upload",
  uploadSingle("image"),
  async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("User not authenticated");
      }

      if (!req.file) {
        throw new BadRequestError("Image file is required");
      }

      const userId = req.user.userId;

      const result = await ProfileImageService.uploadProfileImage(
        userId,
        req.file,
      );

      return ApiResponse.success(res, 200, "Profile image uploaded", result);
    } catch (err) {
      handleError(res, err);
    }
  },
);

profileRouter.delete("/image/delete", async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError("User not authenticated");
    }

    const userId = req.user.userId;

    const result = await ProfileImageService.deleteProfileImage(userId);

    return ApiResponse.success(res, 200, result.message);
  } catch (err) {
    handleError(res, err);
  }
});
