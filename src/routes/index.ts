import { Router } from "express";
import appRouter from "./auth/auth-route";
import profileRouter from "./profile/profile-route";
const router = Router();

router.use("/auth", appRouter);
router.use("/profile", profileRouter);
router.get("/", (req, res) => {
  res.send("Welcome to Shopery Organic E-commerce API 🚀");
});

export default router;
