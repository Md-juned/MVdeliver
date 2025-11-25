import express from "express";
import { authenticateToken,optionalAuthenticateToken } from "../../../common/middleware/jwtToken.middleware.js";
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
  "/addToCart",
  authenticateToken,
  validate(
    Joi.object({
      product_id: Joi.number().integer().required(),
      size_id: Joi.number().integer().optional().allow(null),
      quantity: Joi.number().integer().min(1).optional().default(1),
      addons: Joi.array()
        .items(
          Joi.object({
            addon_id: Joi.number().integer().required(),
            quantity: Joi.number().integer().min(1).required(),
          })
        )
        .optional()
        .default([]),
    })
  ),
  addToCart
);

router.get("/cart", optionalAuthenticateToken, getCart);

router.put(
  "/cart/update",
  authenticateToken,
  validate(
    Joi.object({
      cart_id: Joi.number().integer().required(),
      size_id: Joi.number().integer().optional().allow(null),
      quantity: Joi.number().integer().min(1).optional(),
      addons: Joi.array()
        .items(
          Joi.object({
            addon_id: Joi.number().integer().required(),
            quantity: Joi.number().integer().min(1).required(),
          })
        )
        .optional(),
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

