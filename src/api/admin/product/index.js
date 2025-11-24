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
      status: Joi.string().required(),
      image: Joi.any().optional(), // ⭐ add this
    })
  ),
  addOrEditFoodCategory
);

router.get("/getFoodCategoryList", authenticateToken, getFoodCategoryList);

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
      id: Joi.string().optional(),
      name: Joi.string().required(),
      category_id: Joi.number().required(),
      restaurant_id: Joi.number().required(),
      price: Joi.number().required(),
      offer_price: Joi.number().optional(),
      short_description: Joi.string().optional(),
      status: Joi.string().optional(),
      // Accept direct arrays of objects / strings / integers
      sizes: Joi.string().optional(),
      specifications: Joi.string().optional(),
      addon_ids: Joi.string().optional(),
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
