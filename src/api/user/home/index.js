import express from "express";
import { optionalAuthenticateToken } from "../../../common/middleware/jwtToken.middleware.js";
import {
  getCategories,
  getFeaturedProducts,
  getRestaurants,
  getCuisines,
  getAddons,
  getProductSizes,
} from "./controller.js";

const router = express.Router();

router.get("/categories", getCategories);
router.get("/featuredProducts", optionalAuthenticateToken, getFeaturedProducts);
router.get("/restaurants", getRestaurants);
router.get("/cuisines", getCuisines);
router.get("/addons", getAddons);
router.get("/productSizes", getProductSizes);

export default router;
