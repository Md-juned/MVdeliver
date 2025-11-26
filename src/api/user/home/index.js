import express from "express";
import { optionalAuthenticateToken } from "../../../common/middleware/jwtToken.middleware.js";
import {
  getCategories,
  getFeaturedProducts,
  getPopularProducts,
  getRestaurants,
  getCuisines,
  getAddons,
  getProductSizes,
} from "./controller.js";

const router = express.Router();

router.get("/categories", getCategories);
router.get("/featuredProducts", optionalAuthenticateToken, getFeaturedProducts);
router.get("/popularProducts", optionalAuthenticateToken, getPopularProducts);
router.get("/restaurants", getRestaurants);
router.get("/cuisines", getCuisines);
router.get("/addons", getAddons);
router.get("/productSizes", getProductSizes);

export default router;
