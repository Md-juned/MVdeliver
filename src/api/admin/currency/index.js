import express from "express";
import Joi from "joi";
import { validate } from "../../../common/middleware/validation.middleware.js";
import { authenticateToken } from "../../../common/middleware/jwtToken.middleware.js";
import upload from "../../../utils/multer.js";
import {
  addOrEditCurrency,
  getCurrencyList,
  getSingleCurrency,
  deleteCurrency,
} from "./controller.js";

const router = express.Router();

const baseCurrencySchema = Joi.object({
  id: Joi.number().optional(),
  name: Joi.string().trim().max(120).required(),
  code: Joi.string().trim().max(10).required(),
  icon: Joi.any().optional(),
  country_code: Joi.any().optional(),
  rate: Joi.alternatives(Joi.number().positive().precision(4), Joi.string().allow("", null)).optional(),
  currency_position: Joi.any().optional(),
  status: Joi.any().optional(),
  make_default: Joi.alternatives(Joi.boolean(), Joi.string(), Joi.number()).optional(),
});

router.post(
  "/addOrEditCurrency",
  authenticateToken,
  validate(
    baseCurrencySchema.keys({
      id: Joi.number().optional(),
    })
  ),
  addOrEditCurrency
);

router.get(
  "/getCurrencyList",
  authenticateToken,
  validate(
    Joi.object({
      page: Joi.number().optional(),
      limit: Joi.number().optional(),
      search: Joi.string().allow("", null).optional(),
      status: Joi.string().valid("active", "inactive").optional(),
    }),
    "query"
  ),
  getCurrencyList
);

router.get(
  "/getSingleCurrency",
  authenticateToken,
  validate(
    Joi.object({
      id: Joi.number().required(),
    }),
    "query"
  ),
  getSingleCurrency
);

router.post(
  "/deleteCurrency",
  authenticateToken,
  validate(
    Joi.object({
      id: Joi.number().required(),
    })
  ),
  deleteCurrency
);

export default router;

