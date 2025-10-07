// middleware/guestCart.ts
import { Request, Response, NextFunction } from "express";
import { GuestCartService } from "@/services/guest-cart.service";
import { GuestCart } from "@prisma/client";

export interface GuestCartRequest extends Request {
  guestCart?: GuestCart;
}

export async function guestCartMiddleware(
  req: GuestCartRequest,
  res: Response,
  next: NextFunction
) {
  try {
    let guestToken = req.cookies?.guestToken;

    if (!guestToken) {
      // Create a new guest cart
      const cart = await GuestCartService.createGuestCart(req);

      res.cookie("guestToken", cart.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      req.guestCart = cart;
    } else {
      // Attach existing cart to request
      const cart = await GuestCartService.getGuestCart(guestToken);
      req.guestCart = cart;
    }

    next();
  } catch (err) {
    next(err);
  }
}
