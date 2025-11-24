import express from "express";
import { authenticateToken } from "../../../common/middleware/jwtToken.middleware.js";
import { validate } from "../../../common/middleware/validation.middleware.js";
import Joi from "joi";
import {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
} from "./controller.js";

const router = express.Router();

router.post(
  "/add-to-cart",
  authenticateToken,
  validate(
    Joi.object({
      product_id: Joi.number().integer().required(),
      quantity: Joi.number().integer().min(1).optional().default(1),
    })
  ),
  addToCart
);

router.get("/cart", authenticateToken, getCart);

router.put(
  "/cart/update",
  authenticateToken,
  validate(
    Joi.object({
      cart_id: Joi.number().integer().required(),
      quantity: Joi.number().integer().min(1).required(),
    })
  ),
  updateCartItem
);

router.delete(
  "/cart/remove",
  authenticateToken,
  validate(
    Joi.object({
      cart_id: Joi.number().integer().required(),
    })
  ),
  removeFromCart
);

export default router;

