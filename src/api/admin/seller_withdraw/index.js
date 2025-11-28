import express from "express";
import Joi from "joi";

import { validate } from "../../../common/middleware/validation.middleware.js";
import { authenticateToken } from "../../../common/middleware/jwtToken.middleware.js";
import {
  addOrEditSellerWithdrawMethod,
  getSellerWithdrawMethodList,
  getSingleSellerWithdrawMethod,
  deleteSellerWithdrawMethod,
  getSellerWithdrawList,
  getSellerWithdrawDetail,
  updateSellerWithdrawStatus,
  deleteSellerWithdrawRequest,
} from "./controller.js";

const router = express.Router();

// ======================
// Withdraw Methods
// ======================

router.post(
  "/addOrEditSellerWithdrawMethod",
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
  addOrEditSellerWithdrawMethod
);

router.get(
  "/getSellerWithdrawMethodList",
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
  getSellerWithdrawMethodList
);

router.get(
  "/getSingleSellerWithdrawMethod",
  authenticateToken,
  validate(
    Joi.object({
      id: Joi.number().required(),
    }),
    "query"
  ),
  getSingleSellerWithdrawMethod
);

router.post(
  "/deleteSellerWithdrawMethod",
  authenticateToken,
  validate(
    Joi.object({
      id: Joi.number().required(),
    })
  ),
  deleteSellerWithdrawMethod
);

// ======================
// Withdraw Requests
// ======================

router.get(
  "/getSellerWithdrawList",
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
  getSellerWithdrawList
);

router.get(
  "/getSellerWithdrawDetail",
  authenticateToken,
  validate(
    Joi.object({
      id: Joi.number().required(),
    }),
    "query"
  ),
  getSellerWithdrawDetail
);

router.post(
  "/updateSellerWithdrawStatus",
  authenticateToken,
  validate(
    Joi.object({
      id: Joi.number().required(),
      status: Joi.string().valid("approved", "rejected").required(),
      description: Joi.string().allow("", null).optional(),
    })
  ),
  updateSellerWithdrawStatus
);

router.post(
  "/deleteSellerWithdrawRequest",
  authenticateToken,
  validate(
    Joi.object({
      id: Joi.number().required(),
    })
  ),
  deleteSellerWithdrawRequest
);

export default router;


