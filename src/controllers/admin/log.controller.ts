import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import ApiResponse from "@/libs/ApiResponse.js";
import { handleError } from "@/libs/misc.js";
import { NotFoundError } from "@/libs/AppError.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logsDir = path.join(__dirname, "../../../logs");

export class AdminLogController {
  static async getAppLogs(_req: Request, res: Response) {
    try {
      const logPath = path.join(logsDir, "app.log");
      if (!fs.existsSync(logPath)) {
        throw new NotFoundError("App log file does not exist yet.");
      }

      const content = fs.readFileSync(logPath, "utf-8");
      const lines = content.split("\n").filter(Boolean);
      // Return the last 1000 lines to prevent payload bloat
      const tail = lines.slice(-1000);

      return ApiResponse.success(res, 200, "App logs fetched", { logs: tail });
    } catch (err) {
      handleError(res, err);
    }
  }

  static async getErrorLogs(_req: Request, res: Response) {
    try {
      const logPath = path.join(logsDir, "error.log");
      if (!fs.existsSync(logPath)) {
        throw new NotFoundError("Error log file does not exist yet.");
      }

      const content = fs.readFileSync(logPath, "utf-8");
      const lines = content.split("\n").filter(Boolean);
      const tail = lines.slice(-1000);

      return ApiResponse.success(res, 200, "Error logs fetched", { logs: tail });
    } catch (err) {
      handleError(res, err);
    }
  }
}
