import express from "express";
import Joi from "joi";
import { authenticateToken } from "../../../common/middleware/jwtToken.middleware.js";
import { validate } from "../../../common/middleware/validation.middleware.js";
import upload from "../../../utils/multer.js";
import { getProfile, updateProfile } from "./controller.js";

const router = express.Router();

const updateSchema = Joi.object({
  name: Joi.string().max(255).optional(),
  email: Joi.string().email().max(255).optional(),
  phone: Joi.string().max(50).optional().allow(null, ""),
  country_code: Joi.string().max(10).optional().allow(null, ""),
  address: Joi.string().max(500).optional().allow(null, ""),
  latitude: Joi.number().precision(7).optional().allow(null),
  longitude: Joi.number().precision(7).optional().allow(null),
  dob: Joi.date().iso().optional().allow(null),
});

router.get("/profile", authenticateToken, getProfile);

router.put(
  "/profile",
  authenticateToken,
  upload("users").single("image"),
  validate(updateSchema),
  updateProfile
);

export default router;

