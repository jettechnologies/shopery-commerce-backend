import { Request, Response } from "express";
import { OrderService } from "@/services/order.service";
import ApiResponse from "@/libs/ApiResponse";
import { handleError } from "@/libs/misc";

export class AdminOrderController {
  static async getAllOrders(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const result = await OrderService.getAllOrders(page, limit);
      return ApiResponse.success(res, 200, "Orders fetched", result);
    } catch (err) {
      handleError(res, err);
    }
  }

  static async updateOrderStatus(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
      const { status } = req.body;

      const order = await OrderService.updateOrderStatus(orderId, status);
      return ApiResponse.success(res, 200, "Order status updated", order);
    } catch (err) {
      handleError(res, err);
    }
  }
}
