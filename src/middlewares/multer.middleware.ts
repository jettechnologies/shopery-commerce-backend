import multer from "multer";
import path from "path";

// Local temp storage before Cloudinary upload
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "uploads/");
  },
  filename: (_req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: any) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedVideoTypes = /mp4|mov|avi|mkv/;

  const extname = path.extname(file.originalname).toLowerCase().substring(1);

  if (allowedImageTypes.test(extname) || allowedVideoTypes.test(extname)) {
    cb(null, true);
  } else {
    cb(new Error("Only images and videos are allowed"));
  }
};

export const upload = multer({ storage, fileFilter });
