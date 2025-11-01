import { Router } from "express";
import { ProfileService } from "@/services/profile-service";
import ApiResponse from "@/libs/ApiResponse";
import { UnauthorizedError } from "@/libs/AppError";
import { authGuard, AuthRequest } from "@/middlewares/auth.middleware";
import { handleError } from "@/libs/misc";

const profileRouter = Router();
profileRouter.use(authGuard);

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: User profile and address management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UpdateProfile:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Jane Doe"
 *         email:
 *           type: string
 *           example: "jane@example.com"
 *
 *     CreateAddress:
 *       type: object
 *       required:
 *         - address1
 *         - city
 *         - state
 *         - zip
 *         - country
 *       properties:
 *         address1:
 *           type: string
 *           example: "123 Main St"
 *         address2:
 *           type: string
 *           example: "Apartment 4B"
 *         city:
 *           type: string
 *           example: "New York"
 *         state:
 *           type: string
 *           example: "NY"
 *         zip:
 *           type: string
 *           example: "10001"
 *         country:
 *           type: string
 *           example: "USA"
 */

/**
 * @swagger
 * /profile/get-profile:
 *   get:
 *     summary: Get a user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile object
 *       404:
 *         description: Profile not found
 */
profileRouter.get("/get-profile", async (req: AuthRequest, res) => {
  try {
    const { user } = req;
    if (!user) {
      throw new UnauthorizedError("User not found");
    }
    const userId = user.userId;
    // const userId = req.params.userId;
    const profile = await ProfileService.getProfileByUserId(userId);
    return ApiResponse.success(
      res,
      200,
      "Profile fetched successfully",
      profile
    );
  } catch (err) {
    handleError(res, err);
  }
});

/**
 * @swagger
 * /profile/update-profile:
 *   patch:
 *     summary: Update user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfile'
 *     responses:
 *       200:
 *         description: Updated user profile
 *       400:
 *         description: Validation error
 */
profileRouter.patch("/update-profile", async (req: AuthRequest, res) => {
  try {
    // const userId = req.params.userId;
    const { user } = req;
    if (!user) {
      throw new UnauthorizedError("User not found");
    }
    const userId = user.userId;
    const updated = await ProfileService.updateProfile(userId, req.body);
    return ApiResponse.success(
      res,
      200,
      "Profile updated successfully",
      updated
    );
  } catch (err) {
    handleError(res, err);
  }
});

/**
 * @swagger
 * /profile/address/create:
 *   post:
 *     summary: Add a new address
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAddress'
 *     responses:
 *       201:
 *         description: Address created
 *       400:
 *         description: Failed to add address
 */
profileRouter.post("/address/create", async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId!;

    const address = await ProfileService.addAddress(userId, req.body);
    return ApiResponse.success(
      res,
      201,
      "Address created successfully",
      address
    );
  } catch (err) {
    handleError(res, err);
  }
});

/**
 * @swagger
 * /profile/address/edit-address/{id}:
 *   patch:
 *     summary: Update an address
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAddress'
 *     responses:
 *       200:
 *         description: Address updated
 *       404:
 *         description: Address not found
 */
profileRouter.patch("/address/edit-address/:id", async (req, res) => {
  try {
    const addressId = BigInt(req.params.id);
    const updated = await ProfileService.updateAddress(addressId, req.body);
    return ApiResponse.success(
      res,
      200,
      "Address updated successfully",
      updated
    );
  } catch (err) {
    handleError(res, err);
  }
});

/**
 * @swagger
 * /profile/deactive/{userId}:
 *   delete:
 *     summary: Deactivate user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Profile deactivated
 *       404:
 *         description: User not found
 */
profileRouter.delete("/deactive/:userId", async (req: AuthRequest, res) => {
  try {
    const { user } = req;
    if (!user) {
      throw new UnauthorizedError("User not found");
    }
    //  const userId = user.userId;
    const userId = user.userId || req.params.userId;
    const deactivated = await ProfileService.deactivateProfile(userId);
    return ApiResponse.success(res, 200, "Profile deactivated", deactivated);
  } catch (err) {
    handleError(res, err);
  }
});

export default profileRouter;

// profileRouter.get("/get-profile/:userId", async (req, res) => {
//   try {
//     const userId = req.params.userId;
//     const profile = await ProfileService.getProfileByUserId(userId);
//     return ApiResponse.success(
//       res,
//       200,
//       "Profile fetched successfully",
//       profile
//     );
//   } catch (err) {
//     handleError(res, err);
//   }
// });
