import { Router } from "express";
import tagRouter from "./tag.route.js";
import productRouter from "./product.route.js";
import categoryRouter from "./category.route.js";
import orderRouter from "./order.route.js";
import adminProductCommentRouter from "./product.comment.route.js";
import adminReviewRouter from "./review.route.js";

const adminRouter = Router();
adminRouter.use("/tags", tagRouter);
adminRouter.use("/products", productRouter);
adminRouter.use("/categories", categoryRouter);
adminRouter.use("/orders", orderRouter);
adminRouter.use("/comments", adminProductCommentRouter);
adminRouter.use("/reviews", adminReviewRouter);

export default adminRouter;
