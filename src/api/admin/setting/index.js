import express from "express";
import Joi from "joi";
import { authenticateToken } from "../../../common/middleware/jwtToken.middleware.js";
import { validate } from "../../../common/middleware/validation.middleware.js";
import { getGeneralSetting, saveGeneralSetting } from "./controller.js";

const router = express.Router();

const generalSettingSchema = Joi.object({
  app_name: Joi.string().trim().max(255).required(),
  preloader: Joi.string().valid("enable", "disable").required(),
  commission_type: Joi.string().trim().max(50).required(),
  seller_commission_per_delivery: Joi.number().precision(2).min(0).required(),
  delivery_commission_per_delivery: Joi.number().precision(2).min(0).required(),
  contact_message_receiver_email: Joi.string().email().required(),
  timezone: Joi.string().trim().max(120).required(),
  per_kilometer_delivery_charge: Joi.number().precision(2).min(0).required(),
});

router.post(
  "/saveGeneralSetting",
  authenticateToken,
  validate(generalSettingSchema),
  saveGeneralSetting
);

router.get("/getGeneralSetting", authenticateToken, getGeneralSetting);

export default router;


