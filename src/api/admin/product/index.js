import express from "express";
import Joi from "joi";
import { validate } from "../../../common/middleware/validation.middleware.js";
import {
  addOrEditFoodCategory,
  getFoodCategoryList,
  deleteFoodCategory,
  addOrEditProduct,
  getProducts,
  getSingleProduct,
  deleteProduct,
  addOrEditAddon,
  getAddonList,
  deleteAddon,
  updateProductVisibility,
} from "./controller.js";
import { authenticateToken } from "../../../common/middleware/jwtToken.middleware.js";
import upload from "../../../utils/multer.js";

const router = express.Router();

// Food category //

router.post(
  "/addOrEditFoodCategory",
  authenticateToken,
  upload("FoodCategory").single("image"),
  validate(
    Joi.object({
      id: Joi.number().optional().allow(null, ""),
      name: Joi.string().required(),
      slug: Joi.string().optional(),
      status: Joi.string().required(),
      image: Joi.any().optional(), // ⭐ add this
    })
  ),
  addOrEditFoodCategory
);

router.get(
  "/getFoodCategoryList",
   authenticateToken,
   getFoodCategoryList
);

router.post(
  "/deleteFoodCategory",
  authenticateToken,
  validate(
    Joi.object({
      id: Joi.number().required(),
    })
  ),
  deleteFoodCategory
);

// Product //

router.post(
  "/addOrEditProduct",
  authenticateToken,
  upload("products").single("image"),
  validate(
    Joi.object({
      id: Joi.alternatives().try(Joi.string(), Joi.number()).optional().allow(null, ""),
      name: Joi.string().required(),
      category_id: Joi.alternatives().try(Joi.number(), Joi.string().pattern(/^\d+$/)).required().messages({
        'any.required': 'category_id is required',
        'string.pattern.base': 'category_id must be a valid number'
      }),
      restaurant_id: Joi.alternatives().try(Joi.number(), Joi.string().pattern(/^\d+$/)).required().messages({
        'any.required': 'restaurant_id is required',
        'string.pattern.base': 'restaurant_id must be a valid number'
      }),
      price: Joi.alternatives().try(Joi.number(), Joi.string().pattern(/^\d+(\.\d+)?$/)).required().messages({
        'any.required': 'price is required',
        'string.pattern.base': 'price must be a valid number'
      }),
      offer_price: Joi.alternatives().try(Joi.number(), Joi.string().pattern(/^\d+(\.\d+)?$/)).optional().allow(null, ""),
      short_description: Joi.string().optional().allow(null, ""),
      slug: Joi.string().optional().allow(null, ""),
      status: Joi.string().optional().allow(null, ""),
      is_featured: Joi.alternatives().try(Joi.boolean(), Joi.string(), Joi.number()).optional(),
      visibility: Joi.string().valid("visible", "hidden").optional().allow(null, ""),
      // Accept direct arrays of objects / strings / integers
      sizes: Joi.alternatives().try(
        Joi.string().optional().allow(null, ""),
        Joi.array().optional().allow(null)
      ),
      specifications: Joi.alternatives().try(
        Joi.string().optional().allow(null, ""),
        Joi.array().optional().allow(null)
      ),
      addon_ids: Joi.alternatives().try(
        Joi.string().optional().allow(null, ""),
        Joi.array().items(Joi.alternatives().try(Joi.number(), Joi.string().pattern(/^\d+$/))).optional().allow(null)
      ),
    }).unknown(true)
  ),
  addOrEditProduct
);

router.get("/getProducts",
   authenticateToken,
   getProducts
);

router.get(
  "/getSingleProduct",
  authenticateToken,
  validate(
    Joi.object({
      id: Joi.number().required(),
    })
  ),
  getSingleProduct
);

router.post(
  "/deleteProduct",
  authenticateToken,
  validate(
    Joi.object({
      id: Joi.number().required(),
    })
  ),
  deleteProduct
);

router.post(
  "/updateProductVisibility",
  authenticateToken,
  validate(
    Joi.object({
      id: Joi.number().required(),
      visibility: Joi.string().valid("visible", "hidden").optional(),
      is_featured: Joi.boolean().optional(),
    })
  ),
  updateProductVisibility
);

// Addon Product //

router.post(
  "/addOrEditAddon",
  authenticateToken,
  upload("addons").single("image"),
  validate(
    Joi.object({
      id: Joi.number().optional().allow(null, ""),
      name: Joi.string().required(),
      restaurant_id: Joi.number().required(),
      price: Joi.number().required(),
      status: Joi.string().valid("active", "inactive").required(),
    })
  ),
  addOrEditAddon
);

router.get(
  "/getAddonList",
  authenticateToken,
  validate(
    Joi.object({
      page: Joi.number().optional(),
      limit: Joi.number().optional(),
      search: Joi.string().optional(),
    }),
    "query"
  ),
  getAddonList
);

router.post(
  "/deleteAddon",
  authenticateToken,
  validate(
    Joi.object({
      id: Joi.number().required(),
    })
  ),
  deleteAddon
);

export default router;
