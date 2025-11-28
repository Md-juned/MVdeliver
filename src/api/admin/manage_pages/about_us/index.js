import express from "express";
import Joi from "joi";
import { validate } from "../../../../common/middleware/validation.middleware.js";
import { authenticateToken } from "../../../../common/middleware/jwtToken.middleware.js";
import upload from "../../../../utils/multer.js";
import {
  addOrEditAboutUsPage,
  getAboutUsPage,
  getAboutUsPageList,
  deleteAboutUsPage,
} from "./controller.js";

const router = express.Router();

const baseAboutUsSchema = Joi.object({
  id: Joi.number().optional(),
  language: Joi.string().max(10).optional().default("en"),
  title: Joi.string().max(500).optional().allow(null, ""),
  description: Joi.string().optional().allow(null, ""),
  experience_year: Joi.number().integer().optional().allow(null, ""),
  additional_data: Joi.alternatives()
    .try(Joi.string(), Joi.object(), Joi.array())
    .optional()
    .allow(null, ""),
  about_image: Joi.any().optional(),
}).unknown(true);

router.post(
  "/addOrEditAboutUsPage",
  authenticateToken,
  upload("cms_pages").single("about_image"),
  validate(baseAboutUsSchema),
  addOrEditAboutUsPage
);

router.get(
  "/getAboutUsPage",
  authenticateToken,
  validate(
    Joi.object({
      id: Joi.number().optional(),
      language: Joi.string().max(10).optional().default("en"),
    }),
    "query"
  ),
  getAboutUsPage
);

router.get(
  "/getAboutUsPageList",
  authenticateToken,
  validate(
    Joi.object({
      language: Joi.string().max(10).optional(),
      page: Joi.number().integer().min(1).optional(),
      limit: Joi.number().integer().min(1).optional(),
    }),
    "query"
  ),
  getAboutUsPageList
);

router.post(
  "/deleteAboutUsPage",
  authenticateToken,
  validate(
    Joi.object({
      id: Joi.number().required(),
    })
  ),
  deleteAboutUsPage
);

export default router;

