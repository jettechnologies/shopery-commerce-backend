import express from "express";
import { PublicProductController } from "@/controllers/customer";
import { authGuard, roleGuard } from "@/middlewares/auth.middleware";

const publicProductRouter = express.Router();

// Apply authentication and role guard
publicProductRouter.use(authGuard, roleGuard(["admin", "user"]));

/**
 * @swagger
 * tags:
 *   - name: Products
 *     description: Endpoints for retrieving and filtering product information for users and admins.
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all active products (paginated)
 *     description: Retrieve a paginated list of all active products. Accessible by authenticated users and admins.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The current page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of products per page.
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sorting order based on creation date.
 *     responses:
 *       200:
 *         description: Successfully retrieved paginated list of products.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "a1b2c3d4"
 *                       name:
 *                         type: string
 *                         example: "Wireless Bluetooth Earbuds"
 *                       price:
 *                         type: number
 *                         example: 39.99
 *                       category:
 *                         type: string
 *                         example: "Audio Devices"
 *                       inStock:
 *                         type: boolean
 *                         example: true
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 50
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 */
publicProductRouter.get("/", PublicProductController.getAllProducts);

/**
 * @swagger
 * /products/cursor:
 *   get:
 *     summary: Get products using cursor pagination
 *     description: Retrieve products using cursor-based pagination for efficient infinite scrolling.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *         description: Cursor token for fetching the next batch of products.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of products to retrieve per request.
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sorting order based on creation date.
 *     responses:
 *       200:
 *         description: Successfully retrieved products using cursor pagination.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       price:
 *                         type: number
 *                       images:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             imageUrl:
 *                               type: string
 *                             isPrimary:
 *                               type: boolean
 *                       categories:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                       tags:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     nextCursor:
 *                       type: string
 *                       nullable: true
 *                       example: "5"
 *                     prevCursor:
 *                       type: string
 *                       nullable: true
 *                     hasNextPage:
 *                       type: boolean
 *                     hasPreviousPage:
 *                       type: boolean
 *                     nextLink:
 *                       type: string
 *                       nullable: true
 *                     prevLink:
 *                       type: string
 *                       nullable: true
 */

publicProductRouter.get(
  "/cursor",
  PublicProductController.getAllProductsCursor,
);

/**
 * @swagger
 * /products/filter:
 *   get:
 *     summary: Filter and sort products (paginated)
 *     description: Retrieve products by filtering and sorting criteria such as category, price range, or tags. Paginated response.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Category name or ID to filter products by.
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum product price.
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum product price.
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Comma-separated list of tags to filter products.
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [price, rating, createdAt]
 *           default: createdAt
 *         description: The field to sort products by.
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sorting direction.
 *     responses:
 *       200:
 *         description: Successfully retrieved filtered and sorted products.
 */
publicProductRouter.get("/filter", PublicProductController.getFilteredProducts);

/**
 * @swagger
 * /products/filter/cursor:
 *   get:
 *     summary: Filter and sort products (cursor pagination)
 *     description: Retrieve products using cursor-based pagination with filter and sorting options.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *         description: Cursor token for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of products to fetch per request.
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Category to filter products by.
 *     responses:
 *       200:
 *         description: Successfully retrieved filtered products with cursor pagination.
 */
publicProductRouter.get(
  "/filter/cursor",
  PublicProductController.getFilteredProductsCursor,
);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product by ID
 *     description: Retrieve a single product by its unique identifier. Requires authentication.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the product.
 *     responses:
 *       200:
 *         description: Successfully retrieved product details.
 *       404:
 *         description: Product not found.
 */
publicProductRouter.get("/:id", PublicProductController.getProductById);

/**
 * @swagger
 * /products/slug/{slug}:
 *   get:
 *     summary: Get product by slug (public access)
 *     description: Retrieve a single product using its SEO-friendly slug. Publicly accessible endpoint.
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: The slug of the product.
 *     responses:
 *       200:
 *         description: Successfully retrieved product by slug.
 *       404:
 *         description: Product not found.
 */
publicProductRouter.get(
  "/slug/:slug",
  PublicProductController.getProductBySlug,
);

export default publicProductRouter;

// import express from "express";
// import { PublicProductController } from "@/controllers/customer";
// import { authGuard, roleGuard } from "@/middlewares/auth.middleware";

// const publicProductRouter = express.Router();

// publicProductRouter.use(authGuard, roleGuard(["admin", "user"]));

// /**
//  * @swagger
//  * tags:
//  *   name: Products
//  *   description: Product retrieval and filtering APIs
//  */

// /**
//  * @swagger
//  * /products:
//  *   get:
//  *     summary: Get all active products (paginated)
//  *     tags: [Products]
//  *     parameters:
//  *       - name: page
//  *         in: query
//  *         schema: { type: integer, default: 1 }
//  *       - name: limit
//  *         in: query
//  *         schema: { type: integer, default: 10 }
//  *       - name: sortOrder
//  *         in: query
//  *         schema: { type: string, enum: [asc, desc], default: desc }
//  *     responses:
//  *       200:
//  *         description: Successful response
//  */
// publicProductRouter.get("/", PublicProductController.getAllProducts);

// /**
//  * @swagger
//  * /products/cursor:
//  *   get:
//  *     summary: Get products using cursor pagination
//  *     tags: [Products]
//  */
// publicProductRouter.get(
//   "/cursor",
//   PublicProductController.getAllProductsCursor
// );

// /**
//  * @swagger
//  * /products/filter:
//  *   get:
//  *     summary: Filter and sort products (paginated)
//  *     tags: [Products]
//  */
// publicProductRouter.get("/filter", PublicProductController.getFilteredProducts);

// /**
//  * @swagger
//  * /products/filter/cursor:
//  *   get:
//  *     summary: Filter and sort products (cursor pagination)
//  *     tags: [Products]
//  */
// publicProductRouter.get(
//   "/filter/cursor",
//   PublicProductController.getFilteredProductsCursor
// );

// /**
//  * @swagger
//  * /products/{id}:
//  *   get:
//  *     summary: Get product by ID (Admin only)
//  *     tags: [Products]
//  *     parameters:
//  *       - name: id
//  *         in: path
//  *         required: true
//  *     security:
//  *       - bearerAuth: []
//  */
// publicProductRouter.get("/:id", PublicProductController.getProductById);

// /**
//  * @swagger
//  * /products/slug/{slug}:
//  *   get:
//  *     summary: Get product by slug (Public)
//  *     tags: [Products]
//  *     parameters:
//  *       - name: slug
//  *         in: path
//  *         required: true
//  */
// publicProductRouter.get(
//   "/slug/:slug",
//   PublicProductController.getProductBySlug
// );

// export default publicProductRouter;
