import express from "express";
import Joi from "joi";
import { validate } from "../../common/middleware/validation.middleware.js";
import { authenticateToken } from "../../common/middleware/jwtToken.middleware.js";
import { logout, sendOtp, verifyOtp, login, register } from "./controller.js";


const router = express.Router();

router.post(
  "/sendOtp",
  validate(
    Joi.object({
      country_code: Joi.string().required(),
      mobile_number: Joi.string().required(),
      language: Joi.string().optional().allow("")
    })
  ),
  sendOtp
);

router.post(
  "/verifyOtp",
  validate(
    Joi.object({
      country_code: Joi.string().required(),
      mobile_number: Joi.string().required(),
      otp: Joi.string().required(),
      device_token: Joi.string().optional().allow(""),
      fcm_token: Joi.string().optional().allow(""),
      device_type: Joi.string().optional().allow(""),
      language: Joi.string().optional().allow("")
    })
  ),
  verifyOtp
);

router.post(
  "/register",
  validate(
    Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      phone: Joi.string().optional().allow(""),
      country_code: Joi.string().optional().allow(""),
      language: Joi.string().optional().allow("")
    })
  ),
  register
);

router.post(
  "/login",
  validate(
    Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      language: Joi.string().optional().allow("")
    })
  ),
  login
);


router.post(
  "/logout",
  authenticateToken,
  validate(
    Joi.object({
      device_token: Joi.string().optional().allow("")
    })
  ),
  logout
);

export default router;
