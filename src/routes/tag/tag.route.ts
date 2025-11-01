import express from "express";
import { authGuard } from "@/middlewares/auth.middleware";
import { TagService } from "@/services/tag.service";
import ApiResponse from "@/libs/ApiResponse";
import { handleError } from "@/libs/misc";

const tagRouter = express.Router();
tagRouter.use(authGuard);

/**
 * @swagger
 * tags:
 *   name: Tags
 *   description: Tag management endpoints for both users and admins
 */

/* ----------------------------------- USERS ----------------------------------- */

/**
 * @swagger
 * /tags/get-all:
 *   get:
 *     summary: Get all available tags
 *     description: Public endpoint for users to view all tags.
 *     tags: [Tags]
 *     responses:
 *       200:
 *         description: Successfully fetched all tags
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Tags fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 */
tagRouter.get("/get-all", async (_req, res) => {
  try {
    const tags = await TagService.getAllTags();
    return ApiResponse.success(res, 200, "Tags fetched successfully", tags);
  } catch (err) {
    handleError(res, err);
  }
});

export default tagRouter;
