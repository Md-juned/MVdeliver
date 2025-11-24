import express from "express";
import { getCategories, getFeaturedProducts } from "./controller.js";

const router = express.Router();

router.get("/categories", getCategories);
router.get("/featured-products", getFeaturedProducts);

export default router;
