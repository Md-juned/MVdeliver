import express from "express";
import Joi from "joi";
import { validate } from "../../../../common/middleware/validation.middleware.js";
import { authenticateToken } from "../../../../common/middleware/jwtToken.middleware.js";
import {
  addOrEditPrivacyPolicyPage,
  getPrivacyPolicyPage,
  getPrivacyPolicyPageList,
  deletePrivacyPolicyPage,
} from "./controller.js";

const router = express.Router();

const basePrivacyPolicySchema = Joi.object({
  id: Joi.number().optional(),
  language: Joi.string().max(10).optional().default("en"),
  title: Joi.string().max(500).optional().allow(null, ""),
  description: Joi.string().optional().allow(null, ""),
}).unknown(true);

router.post(
  "/addOrEditPrivacyPolicyPage",
  authenticateToken,
  validate(basePrivacyPolicySchema),
  addOrEditPrivacyPolicyPage
);

router.get(
  "/getPrivacyPolicyPage",
  authenticateToken,
  validate(
    Joi.object({
      id: Joi.number().optional(),
      language: Joi.string().max(10).optional().default("en"),
    }),
    "query"
  ),
  getPrivacyPolicyPage
);

router.get(
  "/getPrivacyPolicyPageList",
  authenticateToken,
  validate(
    Joi.object({
      language: Joi.string().max(10).optional(),
      page: Joi.number().integer().min(1).optional(),
      limit: Joi.number().integer().min(1).optional(),
    }),
    "query"
  ),
  getPrivacyPolicyPageList
);

router.post(
  "/deletePrivacyPolicyPage",
  authenticateToken,
  validate(
    Joi.object({
      id: Joi.number().required(),
    })
  ),
  deletePrivacyPolicyPage
);

export default router;

