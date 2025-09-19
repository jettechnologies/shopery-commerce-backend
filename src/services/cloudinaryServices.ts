import cloudinary from "@/config/cloudinary";

const BASE_FOLDER = "shopery-upload";

export type UploadCategory = "users" | "products" | "posts";

export const uploadToCloudinary = async (
  filePath: string,
  category: UploadCategory
) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `${BASE_FOLDER}/${category}`,
      resource_type: "auto",
    });

    return result;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};
