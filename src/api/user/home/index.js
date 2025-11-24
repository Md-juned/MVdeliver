import express from "express";
import {
  getCategories,
  getFeaturedProducts,
  getRestaurants,
  getCuisines,
} from "./controller.js";

const router = express.Router();

router.get("/categories", getCategories);
router.get("/featured-products", getFeaturedProducts);
router.get("/restaurants", getRestaurants);
router.get("/cuisines", getCuisines);

export default router;
