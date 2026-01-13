import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { BadRequestError } from "@/libs/AppError";

// ✅ Recreate __dirname in ES Module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Create the uploads directory path
const uploadDir = path.join(__dirname, "../../uploads");

// ✅ Ensure uploads directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: any) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedVideoTypes = /mp4|mov|avi|mkv/;
  const extname = path.extname(file.originalname).toLowerCase().substring(1);

  if (allowedImageTypes.test(extname) || allowedVideoTypes.test(extname)) {
    cb(null, true);
  } else {
    cb(new BadRequestError("Only image and video files are allowed."));
  }
};

// ✅ File size limit (5MB per file)
const limits = {
  fileSize: 5 * 1024 * 1024,
};

// ✅ Multer instance for multiple uploads
export const uploadMultiple = (fieldName: string) =>
  multer({
    storage,
    fileFilter,
    limits,
  }).array(fieldName, 10);

//  Multer instance for single upload
// Create the multer instance
export const uploadSingle = (fieldName: string) =>
  multer({
    storage,
    fileFilter,
    limits,
  }).single(fieldName);

// ✅ Error handler
export const handleMulterError = (
  err: any,
  _req: any,
  _res: any,
  next: (err?: any) => void
) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return next(new BadRequestError("Each file must be under 5 MB."));
    }
    return next(new BadRequestError(`Upload error: ${err.message}`));
  }

  if (err instanceof BadRequestError) {
    return next(err);
  }

  return next(new BadRequestError("An unknown file upload error occurred."));
};

// import multer from "multer";
// import path from "path";
// import fs from "fs";
// import { BadRequestError } from "@/libs/AppError";

// const uploadDir = path.join(__dirname, "../../uploads");

// // Ensure uploads directory exists
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// const storage = multer.diskStorage({
//   destination: (_req, _file, cb) => cb(null, uploadDir),
//   filename: (_req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, `${uniqueSuffix}-${file.originalname}`);
//   },
// });

// const fileFilter = (_req: any, file: Express.Multer.File, cb: any) => {
//   const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
//   const allowedVideoTypes = /mp4|mov|avi|mkv/;
//   const extname = path.extname(file.originalname).toLowerCase().substring(1);

//   if (allowedImageTypes.test(extname) || allowedVideoTypes.test(extname)) {
//     cb(null, true);
//   } else {
//     cb(new BadRequestError("Only image and video files are allowed."));
//   }
// };

// // Multer limits: max 5 MB per file
// const limits = {
//   fileSize: 5 * 1024 * 1024,
// };

// // Export the multer instance for multiple files
// export const uploadMultiple = multer({
//   storage,
//   fileFilter,
//   limits,
// }).array("files", 5); // up to 5 files at once (customize as needed)

// // Error handler middleware for multer
// export const handleMulterError = (
//   err: any,
//   _req: any,
//   _res: any,
//   next: (err?: any) => void
// ) => {
//   if (err instanceof multer.MulterError) {
//     if (err.code === "LIMIT_FILE_SIZE") {
//       return next(new BadRequestError("Each file must be under 5 MB."));
//     }
//     return next(new BadRequestError(`Upload error: ${err.message}`));
//   }

//   if (err instanceof BadRequestError) {
//     return next(err);
//   }

//   return next(new BadRequestError("An unknown file upload error occurred."));
// };

// import multer from "multer";
// import path from "path";

// // Local temp storage before Cloudinary upload
// const storage = multer.diskStorage({
//   destination: (_req, _file, cb) => {
//     cb(null, "uploads/");
//   },
//   filename: (_req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

// const fileFilter = (_req: any, file: Express.Multer.File, cb: any) => {
//   const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
//   const allowedVideoTypes = /mp4|mov|avi|mkv/;

//   const extname = path.extname(file.originalname).toLowerCase().substring(1);

//   if (allowedImageTypes.test(extname) || allowedVideoTypes.test(extname)) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only images and videos are allowed"));
//   }
// };

// export const upload = multer({ storage, fileFilter });
