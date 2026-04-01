import { Router } from "express";
import { AdminLogController } from "@/controllers/admin/log.controller.js";
import { authGuard, roleGuard } from "@/middlewares/auth.middleware.js";

const logRouter = Router();

logRouter.use(authGuard, roleGuard(["admin"]));

/**
 * @swagger
 * tags:
 *   name: Admin Logs
 *   description: Admin endpoints for viewing system logs
 * 
 * /admin/logs/app:
 *   get:
 *     summary: Fetch the application log (up to last 1000 lines)
 *     tags: [Admin Logs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of log lines
 * 
 * /admin/logs/error:
 *   get:
 *     summary: Fetch the error log (up to last 1000 lines)
 *     tags: [Admin Logs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of error log lines
 */

logRouter.get("/app", AdminLogController.getAppLogs);
logRouter.get("/error", AdminLogController.getErrorLogs);

export default logRouter;
