import { Router } from "express";
import appRouter from "./auth/auth-route.js";
import profileRouter from "./profile/profile-route.js";
import orderRouter from "./order/order.route.js";
import checkoutRouter from "./checkout/checkout.route.js";
import guestCartRouter from "./guest-cart/guestCart.route.js";
import tagRouter from "./tag/tag.route.js";
import adminRouter from "./admin/index.js";
import categoryRouter from "./category/category.route.js";
import publicProductRouter from "./product/product.route.js";
import cartRouter from "./cart.route.js";
import wishlistRouter from "./wishlist.route.js";
import productCommentRouter from "./product.comment.route.js";
import reviewRouter from "./review.route.js";

const router = Router();

router.use("/auth", appRouter);
router.use("/admin", adminRouter);
router.use("/profile", profileRouter);
router.use("/checkout", checkoutRouter);
router.use("/categories", categoryRouter);
router.use("/guest-cart", guestCartRouter);
router.use("/products", publicProductRouter);
router.use("/orders", orderRouter);
router.use("/tags", tagRouter);
router.use("/cart", cartRouter);
router.use("/wishlist", wishlistRouter);
router.use("/comments", productCommentRouter);
router.use("/reviews", reviewRouter);

router.get("/", (req, res) => {
  res.send("Welcome to Shopery Organic E-commerce API 🚀");
});

export default router;
