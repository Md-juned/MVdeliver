import express from "express";
import { authenticateToken } from "../../../common/middleware/jwtToken.middleware.js";
import { validate } from "../../../common/middleware/validation.middleware.js";
import Joi from "joi";
import {
  addAddress,
  getAddresses,
  updateAddress,
  removeAddress,
} from "./controller.js";

const router = express.Router();

router.post(
  "/addAddress",
  authenticateToken,
  validate(
    Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().optional().allow(null, ""),
      phone: Joi.string().optional().allow(null, ""),
      address: Joi.string().required(),
      latitude: Joi.number().optional().allow(null),
      longitude: Joi.number().optional().allow(null),
      delivery_type: Joi.string().optional().default("Home"),
      is_default: Joi.boolean().optional().default(false),
    })
  ),
  addAddress
);

router.get("/addresses", authenticateToken, getAddresses);

router.put(
  "/addresses/updateAddress/:id",
  authenticateToken,
  validate(
    Joi.object({
      name: Joi.string().optional(),
      email: Joi.string().email().optional().allow(null, ""),
      phone: Joi.string().optional().allow(null, ""),
      address: Joi.string().optional(),
      latitude: Joi.number().optional().allow(null),
      longitude: Joi.number().optional().allow(null),
      delivery_type: Joi.string().optional(),
      is_default: Joi.boolean().optional(),
    })
  ),
  updateAddress
);

router.delete("/addresses/removeAddress/:id", authenticateToken, removeAddress);

export default router;

