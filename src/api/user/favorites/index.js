import express from "express";
import { authenticateToken } from "../../../common/middleware/jwtToken.middleware.js";
import { validate } from "../../../common/middleware/validation.middleware.js";
import Joi from "joi";
import { toggleFavorite, getFavorites } from "./controller.js";

const router = express.Router();

router.post(
  "/toggle-favorite",
  authenticateToken,
  validate(
    Joi.object({
      product_id: Joi.number().integer().required(),
    })
  ),
  toggleFavorite
);

router.get(
  "/favorites",
  authenticateToken,
  validate(
    Joi.object({
      page: Joi.number().integer().min(1).optional(),
      limit: Joi.number().integer().min(1).max(100).optional(),
    })
  ),
  getFavorites
);

export default router;

