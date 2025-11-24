import express from "express";
import Joi from "joi";
import { validate } from "../../../common/middleware/validation.middleware.js";
import { authenticateToken } from "../../../common/middleware/jwtToken.middleware.js";
import upload from "../../../utils/multer.js";
import {
  addOrEditDeliveryman,
  getDeliverymanList,
  deleteDeliveryman,
} from "./controller.js";

const router = express.Router();

router.post(
  "/addOrEditDeliveryman",
  authenticateToken,
  upload("deliveryman").single("image"),
  validate(
    Joi.object({
      id: Joi.number().optional(),
      first_name: Joi.string().when("id", {
        is: Joi.exist(),
        then: Joi.string().optional(),
        otherwise: Joi.string().required(),
      }),
      email: Joi.string()
        .email()
        .when("id", {
          is: Joi.exist(),
          then: Joi.optional(),
          otherwise: Joi.required(),
        }),
      phone_number: Joi.string().when("id", {
        is: Joi.exist(),
        then: Joi.string().optional(),
        otherwise: Joi.string().required(),
      }),
      password: Joi.string().when("id", {
        is: Joi.exist(),
        then: Joi.string().optional(),
        otherwise: Joi.string().required(),
      }),
    }).unknown(true)
  ),
  addOrEditDeliveryman
);

router.get(
  "/getDeliverymanList",
  authenticateToken,
  validate(
    Joi.object({
      page: Joi.number().optional(),
      limit: Joi.number().optional(),
      search: Joi.string().optional().allow(""),
    }),
    "query"
  ),
  getDeliverymanList
);

router.post(
  "/deleteDeliveryman",
  authenticateToken,
  validate(
    Joi.object({
      id: Joi.number().required(),
    })
  ),
  deleteDeliveryman
);

export default router;

