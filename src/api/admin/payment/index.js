import express from "express";
import Joi from "joi";
import { authenticateToken } from "../../../common/middleware/jwtToken.middleware.js";
import { validate } from "../../../common/middleware/validation.middleware.js";
import upload from "../../../utils/multer.js";
import { getStripeGateway, saveStripeGateway } from "./controller.js";

const router = express.Router();

const stripeGatewaySchema = Joi.object({
  status: Joi.string().valid("active", "inactive").optional(),
  currency: Joi.string().trim().max(10).required(),
  stripe_key: Joi.string().trim().max(255).required(),
  stripe_secret: Joi.string().trim().max(255).required(),
});

router.post(
  "/saveStripeGateway",
  authenticateToken,
  upload("PaymentGateway").single("image"),
  validate(stripeGatewaySchema),
  saveStripeGateway
);

router.get("/getStripeGateway", authenticateToken, getStripeGateway);

export default router;


