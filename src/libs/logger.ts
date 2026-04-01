import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logsDir = path.join(__dirname, "../../logs");

// Ensure logs directory exists
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const appLogPath = path.join(logsDir, "app.log");
const errorLogPath = path.join(logsDir, "error.log");

type LogLevel = "INFO" | "WARN" | "ERROR";

function formatEntry(level: LogLevel, message: string, meta?: unknown): string {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` | ${JSON.stringify(meta)}` : "";
  return `[${timestamp}] [${level}] ${message}${metaStr}\n`;
}

function write(filePath: string, entry: string) {
  fs.appendFile(filePath, entry, (err) => {
    if (err) {
      // Fallback: print to stderr so we never silently lose logs
      process.stderr.write(`[logger] Failed to write log: ${err.message}\n`);
    }
  });
}

const logger = {
  info(message: string, meta?: unknown) {
    const entry = formatEntry("INFO", message, meta);
    process.stdout.write(entry);
    write(appLogPath, entry);
  },

  warn(message: string, meta?: unknown) {
    const entry = formatEntry("WARN", message, meta);
    process.stdout.write(entry);
    write(appLogPath, entry);
  },

  error(message: string, meta?: unknown) {
    const entry = formatEntry("ERROR", message, meta);
    process.stderr.write(entry);
    // Write to both logs — critical errors appear in both files
    write(appLogPath, entry);
    write(errorLogPath, entry);
  },
};

export default logger;
