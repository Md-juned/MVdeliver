import express from "express";
import Joi from "joi";
import { optionalAuthenticateToken } from "../../../common/middleware/jwtToken.middleware.js";
import { validate } from "../../../common/middleware/validation.middleware.js";
import { contactTeam } from "./controller.js";

const router = express.Router();

router.post(
  "/contact",
  optionalAuthenticateToken,
  validate(
    Joi.object({
      name: Joi.string().max(255).required(),
      email: Joi.string().email().max(255).required(),
      phone: Joi.string().max(50).optional().allow(null, ""),
      subject: Joi.string().max(255).required(),
      message: Joi.string().max(5000).required(),
    })
  ),
  contactTeam
);

export default router;

