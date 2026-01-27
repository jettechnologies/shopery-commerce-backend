import express from "express";
import { authGuard, roleGuard } from "@/middlewares/auth.middleware";
import { TagService } from "@/services/tag.service";
import ApiResponse from "@/libs/ApiResponse";
import { handleError } from "@/libs/misc";

const tagRouter = express.Router();
tagRouter.use(authGuard);

/**
 * @swagger
 * tags:
 *   name: Tags (Admin)
 *   description: Admin Routes
 */

/**
 * @swagger
 * /admin/tags/get-all:
 *   get:
 *     summary: Get all available tags
 *     description: Public endpoint for users to view all tags.
 *     tags: [Tags (Admin)]
 *     security:
 *       - bearerAuth: []
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
tagRouter.get("/get-all", roleGuard(["admin"]), async (_req, res) => {
  try {
    const tags = await TagService.getAllTags();
    return ApiResponse.success(res, 200, "Tags fetched successfully", tags);
  } catch (err) {
    handleError(res, err);
  }
});

/**
 * @swagger
 * /admin/tags/create:
 *   post:
 *     summary: Create a new tag
 *     description: Admin-only endpoint to create a new tag.
 *     tags: [Tags (Admin)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Tech"
 *     responses:
 *       201:
 *         description: Tag created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
tagRouter.post("/create", roleGuard(["admin"]), async (req, res) => {
  try {
    const tag = await TagService.createTag(req.body);
    return ApiResponse.success(res, 201, "Tag created successfully", tag);
  } catch (err) {
    handleError(res, err);
  }
});

/**
 * @swagger
 * /admin/tags/create-multiple:
 *   post:
 *     summary: Create multiple tags
 *     description: Admin-only endpoint to create multiple tags at once. Duplicate tags are skipped.
 *     tags: [Tags (Admin)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               required:
 *                 - name
 *               properties:
 *                 name:
 *                   type: string
 *                   example: "Technology"
 *                 slug:
 *                   type: string
 *                   example: "technology"
 *     responses:
 *       201:
 *         description: Tags created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Tags created successfully
 *                 createdCount:
 *                   type: number
 *                   example: 3
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */

// Admin: create multiple tags
tagRouter.post("/create-multiple", roleGuard(["admin"]), async (req, res) => {
  try {
    const result = await TagService.createMultipleTags(req.body);

    return ApiResponse.success(res, 201, "Tags created successfully", result);
  } catch (err) {
    handleError(res, err);
  }
});

/**
 * @swagger
 * /admin/tags/edit/{id}:
 *   put:
 *     summary: Update an existing tag
 *     description: Admin-only endpoint to update a tag by its ID.
 *     tags: [Tags (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the tag to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Tag Name"
 *     responses:
 *       200:
 *         description: Tag updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Tag not found
 */
tagRouter.put("/edit/:id", roleGuard(["admin"]), async (req, res) => {
  try {
    const tagId = BigInt(req.params.id);
    const updated = await TagService.updateTag(tagId, req.body);
    return ApiResponse.success(res, 200, "Tag updated successfully", updated);
  } catch (err) {
    handleError(res, err);
  }
});

/**
 * @swagger
 * /admin/tags/delete/{id}:
 *   delete:
 *     summary: Delete a tag
 *     description: Admin-only endpoint to delete a tag by its ID.
 *     tags: [Tags (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the tag to delete
 *     responses:
 *       200:
 *         description: Tag deleted successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Tag not found
 */
tagRouter.delete("/delete/:id", roleGuard(["admin"]), async (req, res) => {
  try {
    const tagId = BigInt(req.params.id);
    const result = await TagService.deleteTag(tagId);
    return ApiResponse.success(res, 200, result.message);
  } catch (err) {
    handleError(res, err);
  }
});

export default tagRouter;
