import express from "express";
import Joi from "joi";
import { validate } from "../../../common/middleware/validation.middleware.js";
import { authenticateToken } from "../../../common/middleware/jwtToken.middleware.js";
import upload from "../../../utils/multer.js";

import {
  addOrEditOfferDealBanner,
  getOfferDealBannerList,
  getSingleOfferDealBanner,
  deleteOfferDealBanner,
  getPromotionalBannerList,
  getSinglePromotionalBanner,
  addOrEditPromotionalBanner,
  deletePromotionalBanner,
} from "./controller.js";

const router = express.Router();

// ======================
// Offer Deal Banners
// ======================

router.post(
  "/addOrEditOfferDealBanner",
  authenticateToken,
  upload("OfferDealBanners").single("image"),
  validate(
    Joi.object({
      id: Joi.number().optional(),
      url: Joi.string()
        .uri()
        .when("id", {
          is: Joi.exist(),
          then: Joi.optional(),
          otherwise: Joi.required(),
        }),
      status: Joi.string().valid("active", "inactive").optional(),
      display_order: Joi.number().integer().min(0).optional(),
    })
  ),
  addOrEditOfferDealBanner
);

router.get(
  "/getOfferDealBannerList",
  authenticateToken,
  validate(
    Joi.object({
      page: Joi.number().optional(),
      limit: Joi.number().optional(),
      search: Joi.string().optional().allow(""),
      status: Joi.string().optional(),
    }),
    "query"
  ),
  getOfferDealBannerList
);

router.get(
  "/getSingleOfferDealBanner",
  authenticateToken,
  validate(
    Joi.object({
      id: Joi.number().required(),
    }),
    "query"
  ),
  getSingleOfferDealBanner
);

router.post(
  "/deleteOfferDealBanner",
  authenticateToken,
  validate(
    Joi.object({
      id: Joi.number().required(),
    })
  ),
  deleteOfferDealBanner
);

// ======================
// Promotional Banners
// ======================

router.get(
  "/getPromotionalBannerList",
  authenticateToken,
  validate(
    Joi.object({
      status: Joi.string().optional(),
      section_key: Joi.string().optional(),
      key: Joi.string().optional(),
    }),
    "query"
  ),
  getPromotionalBannerList
);

router.get(
  "/getSinglePromotionalBanner",
  authenticateToken,
  validate(
    Joi.object({
      id: Joi.number().optional(),
      section_key: Joi.string().optional(),
      key: Joi.string().optional(),
    }).or("id", "section_key", "key"),
    "query"
  ),
  getSinglePromotionalBanner
);

const singlePromotionalBannerSchema = Joi.object({
  id: Joi.number().optional(),
  section_key: Joi.string().optional(),
  key: Joi.string().optional(),
  title: Joi.string().optional(),
  url: Joi.string().uri().allow("", null).optional(),
  status: Joi.string().valid("active", "inactive").optional(),
  display_order: Joi.number().integer().min(0).optional(),
})
  .or("id", "section_key", "key")
  .unknown(true);

const bulkPromotionalBannerSchema = Joi.object({
  banners: Joi.alternatives()
    .try(
      Joi.string(),
      Joi.array()
        .items(
          Joi.object({
            id: Joi.number().optional(),
            section_key: Joi.string().optional(),
            key: Joi.string().optional(),
            title: Joi.string().optional(),
            url: Joi.string().uri().allow("", null).optional(),
            status: Joi.string().valid("active", "inactive").optional(),
            display_order: Joi.number().integer().min(0).optional(),
            image_field: Joi.string().optional(),
          })
            .or("id", "section_key", "key")
            .unknown(true)
        )
        .min(1)
    )
    .required(),
}).unknown(true);

router.post(
  "/addOrEditPromotionalBanner",
  authenticateToken,
  upload("PromotionalBanners").any(),
  validate(Joi.alternatives().try(singlePromotionalBannerSchema, bulkPromotionalBannerSchema)),
  addOrEditPromotionalBanner
);

router.post(
  "/deletePromotionalBanner",
  authenticateToken,
  validate(
    Joi.object({
      id: Joi.number().required(),
    })
  ),
  deletePromotionalBanner
);

export default router;


