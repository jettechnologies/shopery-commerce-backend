import { Router } from "express";
import { ProfileService } from "@/services/profile-service";
import ApiResponse from "@/libs/ApiResponse";
import { AppError, ErrorType } from "@/libs/AppError";
import { ZodError } from "zod";
import { authGuard, AuthRequest } from "@/middlewares/auth.middleware";

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
 * /profile/get-profile/{userId}:
 *   get:
 *     summary: Get a user profile
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
 *         description: User profile object
 *       404:
 *         description: Profile not found
 */
profileRouter.get("/get-profile/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const profile = await ProfileService.getProfileByUserId(userId);
    return ApiResponse.success(
      res,
      200,
      "Profile fetched successfully",
      profile
    );
  } catch (err) {
    const error = err as AppError;

    // Zod validation errors
    if (err instanceof ZodError) {
      const errors = err.issues.map((e) => e.message).join(", ");
      return ApiResponse.validation(res, errors);
    }

    if (error.errorType === ErrorType.NOT_FOUND) {
      return ApiResponse.notFound(res, error.message || "Profile not found");
    }
    return ApiResponse.badRequest(
      res,
      error.message || "Failed to fetch profile"
    );
  }
});

/**
 * @swagger
 * /profile/update-profile/{userId}:
 *   patch:
 *     summary: Update user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
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
profileRouter.patch("/update-profile/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const updated = await ProfileService.updateProfile(userId, req.body);
    return ApiResponse.success(
      res,
      200,
      "Profile updated successfully",
      updated
    );
  } catch (err) {
    const error = err as AppError;

    // Zod validation errors
    if (err instanceof ZodError) {
      const errors = err.issues.map((e) => e.message).join(", ");
      return ApiResponse.validation(res, errors);
    }

    if (error.errorType === ErrorType.CONFLICT) {
      return ApiResponse.conflict(res, error.message || "Email already exists");
    }
    return ApiResponse.badRequest(
      res,
      error.message || "Failed to update profile"
    );
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

    console.log(userId, "user id");

    const address = await ProfileService.addAddress(userId, req.body);
    return ApiResponse.success(
      res,
      201,
      "Address created successfully",
      address
    );
  } catch (err) {
    const error = err as AppError;

    // Zod validation errors
    if (err instanceof ZodError) {
      const errors = err.issues.map((e) => e.message).join(", ");
      return ApiResponse.validation(res, errors);
    }

    if (error.errorType === ErrorType.NOT_FOUND) {
      return ApiResponse.notFound(res, "User not found");
    }
    return ApiResponse.badRequest(res, "Failed to create address");
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
    const error = err as AppError;

    // Zod validation errors
    if (err instanceof ZodError) {
      const errors = err.issues.map((e) => e.message).join(", ");
      return ApiResponse.validation(res, errors);
    }

    if (error.errorType === ErrorType.NOT_FOUND) {
      return ApiResponse.notFound(res, "Address not found");
    }
    return ApiResponse.badRequest(res, "Failed to update address");
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
    const userId = req.params.userId;
    const deactivated = await ProfileService.deactivateProfile(userId);
    return ApiResponse.success(res, 200, "Profile deactivated", deactivated);
  } catch (err) {
    const error = err as AppError;

    // Zod validation errors
    if (err instanceof ZodError) {
      const errors = err.issues.map((e) => e.message).join(", ");
      return ApiResponse.validation(res, errors);
    }

    if (error.errorType === ErrorType.NOT_FOUND) {
      return ApiResponse.notFound(res, "User not found");
    }
    return ApiResponse.badRequest(res, "Failed to deactivate profile");
  }
});

export default profileRouter;

// import { Router } from "express";
// import { ProfileService } from "@/services/profile-service";
// import {
//   CreateUserSchema,
//   LoginUserSchema,
//   ForgotPasswordSchema,
//   ResetPasswordSchema,
// } from "@/schema/zod-schema";
// import ApiResponse from "@/libs/ApiResponse";
// import { AppError, ErrorType } from "@/libs/AppError";
// import { ZodError } from "zod";
// import {
//   authGuard,
//   roleGuard,
//   AuthRequest,
// } from "@/middlewares/auth.middleware";

// const profileRouter = Router();

// profileRouter.use(authGuard);

// /**
//  * @swagger
//  * tags:
//  *   name: Profile
//  *   description: User profile and address management
//  */

// /**
//  * @swagger
//  * /profile/get-profile/{userId}:
//  *   get:
//  *     summary: Get a user profile
//  *     description: Retrieve a user profile and related entities by UUID.
//  *     tags: [Profile]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: userId
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: The UUID of the user
//  *     responses:
//  *       200:
//  *         description: User profile object
//  *       404:
//  *         description: Profile not found
//  */

// // Get user profile
// profileRouter.get("/get-profile/:userId", async (req, res) => {
//   try {
//     const userId = req.params.userId;
//     const profile = await ProfileService.getProfileByUserId(userId);
//     res.json(profile);
//   } catch (err: any) {
//     res.status(err.statusCode || 400).json({ message: err.message });
//   }
// });

// /**
//  * @swagger
//  * /profile/update-profile/{userId}:
//  *   put:
//  *     summary: Update user profile
//  *     description: Update basic profile information like name or email.
//  *     tags: [Profile]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: userId
//  *         required: true
//  *         schema:
//  *           type: string
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               name:
//  *                 type: string
//  *               email:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Updated user profile
//  *       400:
//  *         description: Validation error
//  */

// // Update user profile
// profileRouter.put("/update-profile/:userId", async (req, res) => {
//   try {
//     const userId = req.params.userId;
//     const updated = await ProfileService.updateProfile(userId, req.body);
//     res.json(updated);
//   } catch (err: any) {
//     res.status(err.statusCode || 400).json({ message: err.message });
//   }
// });

// /**
//  * @swagger
//  * /address/create:
//  *   post:
//  *     summary: Add a new address
//  *     description: Add an address for the authenticated user.
//  *     tags: [Profile]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               address1:
//  *                 type: string
//  *               address2:
//  *                 type: string
//  *               city:
//  *                 type: string
//  *               state:
//  *                 type: string
//  *               zip:
//  *                 type: string
//  *               country:
//  *                 type: string
//  *     responses:
//  *       201:
//  *         description: Address created
//  *       400:
//  *         description: Failed to add address
//  */

// // Add address
// profileRouter.post("/address/create", async (req: AuthRequest, res) => {
//   try {
//     const userId = req.user?.userId!;
//     const address = await ProfileService.addAddress(userId, req.body);
//     res.json(address);
//   } catch (err: any) {
//     res.status(err.statusCode || 400).json({ message: err.message });
//   }
// });

// /**
//  * @swagger
//  * /address/edit-address/{id}:
//  *   put:
//  *     summary: Update an address
//  *     description: Update an existing address by ID.
//  *     tags: [Profile]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: Address ID
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               address1:
//  *                 type: string
//  *               city:
//  *                 type: string
//  *               state:
//  *                 type: string
//  *               zip:
//  *                 type: string
//  *               country:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Address updated
//  *       404:
//  *         description: Address not found
//  */

// // Update address
// profileRouter.put("/address/edit-address/:id", async (req, res) => {
//   try {
//     const addressId = BigInt(req.params.id);
//     const updated = await ProfileService.updateAddress(addressId, req.body);
//     res.json(updated);
//   } catch (err: any) {
//     res.status(err.statusCode || 400).json({ message: err.message });
//   }
// });

// /**
//  * @swagger
//  * /profile/deactive/{userId}:
//  *   delete:
//  *     summary: Deactivate user profile
//  *     description: Soft delete (deactivate) a user profile.
//  *     tags: [Profile]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: userId
//  *         required: true
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Profile deactivated
//  *       404:
//  *         description: User not found
//  */

// // Deactivate profile
// profileRouter.delete("/deactive/:userId", async (req: AuthRequest, res) => {
//   try {
//     const userId = req.params.userId;
//     const deactivated = await ProfileService.deactivateProfile(userId);
//     res.json(deactivated);
//   } catch (err: any) {
//     res.status(err.statusCode || 400).json({ message: err.message });
//   }
// });

// export default profileRouter;
