import { Router } from "express";
import tagRouter from "./tag.route";
import productRouter from "./product.route";
import categoryRouter from "./category.route";
import orderRouter from "./order.route";

const adminRouter = Router();
adminRouter.use("/tags", tagRouter);
adminRouter.use("/products", productRouter);
adminRouter.use("/categories", categoryRouter);
adminRouter.use("/orders", orderRouter);

export default adminRouter;
