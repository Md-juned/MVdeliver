import express from "express";
import Joi from "joi";
import { validate } from "../../../common/middleware/validation.middleware.js";
import { authenticateToken } from "../../../common/middleware/jwtToken.middleware.js";
import {
  // Coupon
  addOrEditCoupon,
  getCouponList,
  getSingleCoupon,
  deleteCoupon,
  // Offer
  addOrEditOffer,
  getOfferList,
  getSingleOffer,
  deleteOffer,
  // Offer Product
  addOfferProduct,
  getOfferProductList,
  deleteOfferProduct,
} from "./controller.js";

const router = express.Router();

// ========== Coupon Routes ==========

router.post(
  "/addOrEditCoupon",
  authenticateToken,
  validate(
    Joi.object({
      id: Joi.number().optional(),
      name: Joi.string().required(),
      code: Joi.string().required(),
      expired_date: Joi.date().required(),
      min_purchase_price: Joi.number().min(0).required(),
      discount_type: Joi.string().valid("fixed", "percentage").optional().allow("",null),
      discount: Joi.number().min(0).required(),
      status: Joi.string().valid("active", "inactive").optional(),
    })
  ),
  addOrEditCoupon
);

router.get(
  "/getCouponList",
  authenticateToken,
  validate(
    Joi.object({
      page: Joi.number().optional(),
      limit: Joi.number().optional(),
      search: Joi.string().optional().allow(""),
    }),
    "query"
  ),
  getCouponList
);

router.get(
  "/getSingleCoupon",
  authenticateToken,
  validate(
    Joi.object({
      id: Joi.number().required(),
    }),
    "query"
  ),
  getSingleCoupon
);

router.post(
  "/deleteCoupon",
  authenticateToken,
  validate(
    Joi.object({
      id: Joi.number().required(),
    })
  ),
  deleteCoupon
);

// ========== Offer Routes ==========

router.post(
  "/addOrEditOffer",
  authenticateToken,
  validate(
    Joi.object({
      id: Joi.number().optional(),
      title: Joi.string().required(),
      description: Joi.string().optional().allow(""),
      offer_percentage: Joi.number().min(0).max(100).required(),
      end_time: Joi.date().required(),
      status: Joi.string().valid("active", "inactive").optional(),
    })
  ),
  addOrEditOffer
);

router.get(
  "/getOfferList",
  authenticateToken,
  validate(
    Joi.object({
      page: Joi.number().optional(),
      limit: Joi.number().optional(),
      search: Joi.string().optional().allow(""),
    }),
    "query"
  ),
  getOfferList
);

router.get(
  "/getSingleOffer",
  authenticateToken,
  validate(
    Joi.object({
      id: Joi.number().required(),
    }),
    "query"
  ),
  getSingleOffer
);

router.post(
  "/deleteOffer",
  authenticateToken,
  validate(
    Joi.object({
      id: Joi.number().required(),
    })
  ),
  deleteOffer
);

// ========== Offer Product Routes ==========

router.post(
  "/addOfferProduct",
  authenticateToken,
  validate(
    Joi.object({
      product_id: Joi.number().required(),
    })
  ),
  addOfferProduct
);

router.get(
  "/getOfferProductList",
  authenticateToken,
  validate(
    Joi.object({
      page: Joi.number().optional(),
      limit: Joi.number().optional(),
      offer_id: Joi.number().optional(),
      search: Joi.string().optional().allow(""),
    }),
    "query"
  ),
  getOfferProductList
);

router.post(
  "/deleteOfferProduct",
  authenticateToken,
  validate(
    Joi.object({
      id: Joi.number().required(),
    })
  ),
  deleteOfferProduct
);

export default router;

