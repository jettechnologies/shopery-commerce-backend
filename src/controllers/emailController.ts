import { Request, Response } from "express";
import { EmailService, EmailTemplate } from "@/libs/EmailService";

export class EmailController {
  static async sendWelcome(req: Request, res: Response) {
    try {
      const { email, name } = req.body;

      await EmailService.sendMail({
        to: email,
        subject: "Welcome to Gearmates 🎉",
        template: EmailTemplate.WELCOME,
        context: { name },
      });

      res.json({ success: true, message: "Welcome email sent" });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Email sending failed", error });
    }
  }

  static async sendPasswordReset(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;

      await EmailService.sendMail({
        to: email,
        subject: "Password Reset Request",
        template: EmailTemplate.PASSWORD_RESET,
        context: { otp },
      });

      res.json({ success: true, message: "Password reset email sent" });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Email sending failed", error });
    }
  }

  static async sendOrderConfirmation(req: Request, res: Response) {
    try {
      const { email, orderId, items, total } = req.body;

      await EmailService.sendMail({
        to: email,
        subject: `Order Confirmation - #${orderId}`,
        template: EmailTemplate.ORDER_CONFIRMATION,
        context: { orderId, items, total },
      });

      res.json({ success: true, message: "Order confirmation email sent" });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Email sending failed", error });
    }
  }
}
