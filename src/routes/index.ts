import { Router } from "express";
import appRouter from "./auth/auth-route";
const router = Router();

router.use("/auth", appRouter);
router.get("/", (req, res) => {
  res.send("Welcome to Shopery Organic E-commerce API 🚀");
});

export default router;
