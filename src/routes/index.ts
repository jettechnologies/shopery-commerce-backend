import { Router } from "express";
import appRouter from "./auth/auth-route";
import profileRouter from "./profile/profile-route";
import orderRouter from "./order/order.route";
import checkoutRouter from "./checkout/checkout.route";
import guestCartRouter from "./guest-cart/guestCart.route";
import tagRouter from "./tag/tag.route";
import adminRouter from "./admin";
import categoryRouter from "./category/category.route";
const router = Router();

router.use("/auth", appRouter);
router.use("/admin", adminRouter);
router.use("/profile", profileRouter);
router.use("/checkout", checkoutRouter);
router.use("/categories", categoryRouter);
router.use("/guest-cart", guestCartRouter);
router.use("/orders", orderRouter);
router.use("/tags", tagRouter);
router.get("/", (req, res) => {
  res.send("Welcome to Shopery Organic E-commerce API 🚀");
});

export default router;
