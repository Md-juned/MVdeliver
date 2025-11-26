import express from "express";
import Joi from "joi";
import { validate } from "../../../common/middleware/validation.middleware.js";
import { authenticateToken } from "../../../common/middleware/jwtToken.middleware.js";
import { register, login, googleLogin, facebookLogin, changePassword } from "./controller.js";

const router = express.Router();

router.post(
  "/register",
  validate(
    Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      fcm_token: Joi.string().optional().allow(null,""),
      device_id: Joi.string().required(),
      device: Joi.string().required(),
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
      fcm_token: Joi.string().optional().allow(null, ""),
      device_id: Joi.string().optional().allow(null, ""),
      device: Joi.string().optional().allow(null, ""),
    })
  ),
  login
);

router.post(
  "/googleLogin",
  validate(
    Joi.object({
      google_id: Joi.string().required(),
      email: Joi.string().email().required(),
      name: Joi.string().optional().allow(null, ""),
      image: Joi.string().uri().optional().allow(null, ""),
      fcm_token: Joi.string().optional().allow(null, ""),
      device_id: Joi.string().optional().allow(null, ""),
      device: Joi.string().optional().allow(null, ""),
    })
  ),
  googleLogin
);

router.post(
  "/facebookLogin",
  validate(
    Joi.object({
      facebook_id: Joi.string().required(),
      email: Joi.string().email().optional().allow(null, ""),
      name: Joi.string().optional().allow(null, ""),
      image: Joi.string().uri().optional().allow(null, ""),
      fcm_token: Joi.string().optional().allow(null, ""),
      device_id: Joi.string().optional().allow(null, ""),
      device: Joi.string().optional().allow(null, ""),
    })
  ),
  facebookLogin
);

router.put(
  "/changePassword",
  authenticateToken,
  validate(
    Joi.object({
      current_password: Joi.string().required(),
      new_password: Joi.string().min(6).required(),
      confirm_password: Joi.string()
        .valid(Joi.ref("new_password"))
        .required()
        .messages({ "any.only": "confirm_password must match new_password" }),
    })
  ),
  changePassword
);

export default router;
