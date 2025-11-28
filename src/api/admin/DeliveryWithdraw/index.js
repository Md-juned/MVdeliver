import express from "express";
import Joi from "joi";

import { validate } from "../../../common/middleware/validation.middleware.js";
import { authenticateToken } from "../../../common/middleware/jwtToken.middleware.js";
import {
  addOrEditDeliveryWithdrawMethod,
  getDeliveryWithdrawMethodList,
  getSingleDeliveryWithdrawMethod,
  deleteDeliveryWithdrawMethod,
  getDeliveryWithdrawList,
  getDeliveryWithdrawDetail,
  updateDeliveryWithdrawStatus,
  deleteDeliveryWithdrawRequest,
} from "./controller.js";

const router = express.Router();

// ======================
// Delivery Withdraw Methods
// ======================

router.post(
  "/addOrEditDeliveryWithdrawMethod",
  authenticateToken,
  validate(
    Joi.object({
      id: Joi.number().optional(),
      name: Joi.string().trim().when("id", {
        is: Joi.exist(),
        then: Joi.optional(),
        otherwise: Joi.required(),
      }),
      minimum_amount: Joi.number().precision(2).min(0).when("id", {
        is: Joi.exist(),
        then: Joi.optional(),
        otherwise: Joi.required(),
      }),
      maximum_amount: Joi.number().precision(2).min(0).when("id", {
        is: Joi.exist(),
        then: Joi.optional(),
        otherwise: Joi.required(),
      }),
      withdraw_charge: Joi.number().precision(2).min(0).when("id", {
        is: Joi.exist(),
        then: Joi.optional(),
        otherwise: Joi.required(),
      }),
      description: Joi.string().when("id", {
        is: Joi.exist(),
        then: Joi.optional(),
        otherwise: Joi.required(),
      }),
      status: Joi.string().valid("active", "inactive").optional(),
    })
  ),
  addOrEditDeliveryWithdrawMethod
);

router.get(
  "/getDeliveryWithdrawMethodList",
  authenticateToken,
  validate(
    Joi.object({
      page: Joi.number().optional(),
      limit: Joi.number().optional(),
      search: Joi.string().allow("", null).optional(),
      status: Joi.string().valid("active", "inactive").optional(),
    }),
    "query"
  ),
  getDeliveryWithdrawMethodList
);

router.get(
  "/getSingleDeliveryWithdrawMethod",
  authenticateToken,
  validate(
    Joi.object({
      id: Joi.number().required(),
    }),
    "query"
  ),
  getSingleDeliveryWithdrawMethod
);

router.post(
  "/deleteDeliveryWithdrawMethod",
  authenticateToken,
  validate(
    Joi.object({
      id: Joi.number().required(),
    })
  ),
  deleteDeliveryWithdrawMethod
);

// ======================
// Delivery Withdraw Requests
// ======================

router.get(
  "/getDeliveryWithdrawList",
  authenticateToken,
  validate(
    Joi.object({
      page: Joi.number().optional(),
      limit: Joi.number().optional(),
      search: Joi.string().allow("", null).optional(),
      status: Joi.string().valid("pending", "approved", "rejected").optional(),
    }),
    "query"
  ),
  getDeliveryWithdrawList
);

router.get(
  "/getDeliveryWithdrawDetail",
  authenticateToken,
  validate(
    Joi.object({
      id: Joi.number().required(),
    }),
    "query"
  ),
  getDeliveryWithdrawDetail
);

router.post(
  "/updateDeliveryWithdrawStatus",
  authenticateToken,
  validate(
    Joi.object({
      id: Joi.number().required(),
      status: Joi.string().valid("approved", "rejected").required(),
      description: Joi.string().allow("", null).optional(),
    })
  ),
  updateDeliveryWithdrawStatus
);

router.post(
  "/deleteDeliveryWithdrawRequest",
  authenticateToken,
  validate(
    Joi.object({
      id: Joi.number().required(),
    })
  ),
  deleteDeliveryWithdrawRequest
);

export default router;


