import express from "express";
import Joi from "joi";
import { validate } from "../../../../common/middleware/validation.middleware.js";
import { authenticateToken } from "../../../../common/middleware/jwtToken.middleware.js";
import {
  addOrEditTermsConditionsPage,
  getTermsConditionsPage,
  getTermsConditionsPageList,
  deleteTermsConditionsPage,
} from "./controller.js";

const router = express.Router();

const baseTermsConditionsSchema = Joi.object({
  id: Joi.number().optional(),
  language: Joi.string().max(10).optional().default("en"),
  title: Joi.string().max(500).optional().allow(null, ""),
  description: Joi.string().optional().allow(null, ""),
}).unknown(true);

router.post(
  "/addOrEditTermsConditionsPage",
  authenticateToken,
  validate(baseTermsConditionsSchema),
  addOrEditTermsConditionsPage
);

router.get(
  "/getTermsConditionsPage",
  authenticateToken,
  validate(
    Joi.object({
      id: Joi.number().optional(),
      language: Joi.string().max(10).optional().default("en"),
    }),
    "query"
  ),
  getTermsConditionsPage
);

router.get(
  "/getTermsConditionsPageList",
  authenticateToken,
  validate(
    Joi.object({
      language: Joi.string().max(10).optional(),
      page: Joi.number().integer().min(1).optional(),
      limit: Joi.number().integer().min(1).optional(),
    }),
    "query"
  ),
  getTermsConditionsPageList
);

router.post(
  "/deleteTermsConditionsPage",
  authenticateToken,
  validate(
    Joi.object({
      id: Joi.number().required(),
    })
  ),
  deleteTermsConditionsPage
);

export default router;

