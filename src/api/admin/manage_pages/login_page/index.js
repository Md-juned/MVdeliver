import express from "express";
import Joi from "joi";
import { validate } from "../../../../common/middleware/validation.middleware.js";
import { authenticateToken } from "../../../../common/middleware/jwtToken.middleware.js";
import upload from "../../../../utils/multer.js";
import {
  addOrEditLoginPage,
  getLoginPage,
  getLoginPageList,
  deleteLoginPage,
} from "./controller.js";

const router = express.Router();

const baseLoginPageSchema = Joi.object({
  id: Joi.number().optional(),
  language: Joi.string().max(10).optional().default("en"),
  title_one: Joi.string().max(500).optional().allow(null, ""),
  description_one: Joi.string().optional().allow(null, ""),
  title_two: Joi.string().max(500).optional().allow(null, ""),
  description_two: Joi.string().optional().allow(null, ""),
  title_three: Joi.string().max(500).optional().allow(null, ""),
  description_three: Joi.string().optional().allow(null, ""),
  image_one: Joi.any().optional(),
  image_two: Joi.any().optional(),
  image_three: Joi.any().optional(),
}).unknown(true);

router.post(
  "/addOrEditLoginPage",
  authenticateToken,
  upload("cms_pages").fields([
    { name: "image_one", maxCount: 1 },
    { name: "image_two", maxCount: 1 },
    { name: "image_three", maxCount: 1 },
  ]),
  validate(baseLoginPageSchema),
  addOrEditLoginPage
);

router.get(
  "/getLoginPage",
  authenticateToken,
  validate(
    Joi.object({
      id: Joi.number().optional(),
      language: Joi.string().max(10).optional().default("en"),
    }),
    "query"
  ),
  getLoginPage
);

router.get(
  "/getLoginPageList",
  authenticateToken,
  validate(
    Joi.object({
      language: Joi.string().max(10).optional(),
      page: Joi.number().integer().min(1).optional(),
      limit: Joi.number().integer().min(1).optional(),
    }),
    "query"
  ),
  getLoginPageList
);

router.post(
  "/deleteLoginPage",
  authenticateToken,
  validate(
    Joi.object({
      id: Joi.number().required(),
    })
  ),
  deleteLoginPage
);

export default router;

