// services/profile.service.ts
import { NotFoundError, BadRequestError, ConflictError } from "@/libs/AppError";
import { prisma } from "@/prisma/client.js";
import { deleteFromCloudinary, uploadToCloudinary } from "./cloudinary.service";

export class ProfileImageService {
  static async uploadProfileImage(userId: string, file: Express.Multer.File) {
    const user = await prisma.user.findUnique({ where: { userId } });
    if (!user) throw new NotFoundError("User not found");

    const uploaded = await uploadToCloudinary(file.path, "profile");

    const existing = await prisma.userProfileImage.findUnique({
      where: { userId: user.id },
    });

    if (existing) {
      // 🔥 Replace existing
      return prisma.userProfileImage.update({
        where: { userId: user.id },
        data: {
          imageUrl: uploaded.url,
          publicId: uploaded.public_id,
        },
      });
    }

    return prisma.userProfileImage.create({
      data: {
        userId: user.id,
        imageUrl: uploaded.url,
        publicId: uploaded.public_id,
      },
    });
  }

  static async deleteProfileImage(userId: string) {
    const user = await prisma.user.findUnique({ where: { userId } });
    if (!user) throw new NotFoundError("User not found");

    const existing = await prisma.userProfileImage.findUnique({
      where: { userId: user.id },
    });

    if (!existing) throw new NotFoundError("No profile image found");

    await deleteFromCloudinary(existing.publicId);

    await prisma.userProfileImage.delete({
      where: { userId: user.id },
    });

    return { message: "Profile image deleted" };
  }
}
