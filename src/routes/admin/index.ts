import { Router } from "express";
import tagRouter from "./tag.route";
import productRouter from "./product.route";
import categoryRouter from "./category.route";

const adminRouter = Router();
adminRouter.use("/tags", tagRouter);
adminRouter.use("/products", productRouter);
adminRouter.use("/categories", categoryRouter);

export default adminRouter;
