import express from "express";
import Joi from "joi";
import { validate } from "../../../common/middleware/validation.middleware.js";
import { logout,createAdmin,adminLogin } from "./controller.js";
import { authenticateToken } from "../../../common/middleware/jwtToken.middleware.js";


const router = express.Router();


router.post('/adminLogin',
    validate(
        Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().required()
        })
    ), adminLogin);

router.post(
  "/createAdmin",
  createAdmin
);

router.post(
  "/logout",
  validate(
    Joi.object({
      device_token: Joi.string().optional().allow("")
    })
  ),
  logout
);

export default router;
