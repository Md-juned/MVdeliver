import express from "express";
import Joi from "joi";
import { validate } from "../../../../common/middleware/validation.middleware.js";
import { authenticateToken } from "../../../../common/middleware/jwtToken.middleware.js";
import {
  addOrEditContactUsPage,
  getContactUsPage,
  getContactUsPageList,
  deleteContactUsPage,
} from "./controller.js";

const router = express.Router();

const baseContactUsSchema = Joi.object({
  id: Joi.number().optional(),
  language: Joi.string().max(10).optional().default("en"),
  title: Joi.string().max(500).optional().allow(null, ""),
  email: Joi.string().email().optional().allow(null, ""),
  phone: Joi.string().max(50).optional().allow(null, ""),
}).unknown(true);

router.post(
  "/addOrEditContactUsPage",
  authenticateToken,
  validate(baseContactUsSchema),
  addOrEditContactUsPage
);

router.get(
  "/getContactUsPage",
  authenticateToken,
  validate(
    Joi.object({
      id: Joi.number().optional(),
      language: Joi.string().max(10).optional().default("en"),
    }),
    "query"
  ),
  getContactUsPage
);

router.get(
  "/getContactUsPageList",
  authenticateToken,
  validate(
    Joi.object({
      language: Joi.string().max(10).optional(),
      page: Joi.number().integer().min(1).optional(),
      limit: Joi.number().integer().min(1).optional(),
    }),
    "query"
  ),
  getContactUsPageList
);

router.post(
  "/deleteContactUsPage",
  authenticateToken,
  validate(
    Joi.object({
      id: Joi.number().required(),
    })
  ),
  deleteContactUsPage
);

export default router;

