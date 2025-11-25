import express from "express";
import Joi from "joi";
import { validate } from "../../../common/middleware/validation.middleware.js";
import { addOrEditCuisine,
         getCuisineList,
         deleteCuisine,
         addOrEditCity,
         getCity,
         deleteCity,
         addOrEditRestaurant,
         getRestaurant,
         deleteRestaurant
} from "./controller.js";
import { authenticateToken } from "../../../common/middleware/jwtToken.middleware.js";
import  upload from "../../../utils/multer.js"


const router = express.Router();

// Cuisine //

router.post(
 "/addOrEditCuisine",
  authenticateToken,
  upload("Cuisine").single("image"),
  validate(
    Joi.object({
      id: Joi.number().optional(),
      name: Joi.string().required(),
      slug: Joi.string().optional(),
      status: Joi.string().optional().valid('active', 'hidden'),
    })
  ),
  addOrEditCuisine
);

router.get(
  "/getCuisineList",
  authenticateToken,
  validate(
    Joi.object({
      page: Joi.number().optional(),
      limit: Joi.number().optional(),
      search: Joi.string().optional().allow("",null),
      status: Joi.string().optional(),
    })
  ),
  getCuisineList
);

router.post(
  "/deleteCuisine",
  authenticateToken,
   validate(
      Joi.object({
        id: Joi.number().required(),
      })
    ),
  deleteCuisine
);

// City //

router.post(
 "/addOrEditCity",
  authenticateToken,
  upload("City").single("image"),
  validate(
    Joi.object({
      id: Joi.number().optional(),
      name: Joi.string().required(),
    })
  ),
  addOrEditCity
);

router.get(
  "/getCity",
  authenticateToken,
  validate(
    Joi.object({
      page: Joi.number().optional(),
      limit: Joi.number().optional(),
      search: Joi.string().optional().allow("",null),
      status: Joi.string().optional(),
    })
  ),
  getCity
);

router.post(
  "/deleteCity",
  authenticateToken,
   validate(
      Joi.object({
        id: Joi.number().required(),
      })
    ),
  deleteCity
);

// Restaurant //

router.post(
  "/addOrEditRestaurant",
  authenticateToken,
  upload("restaurants").fields([
    { name: "logo_image", maxCount: 1 },
    { name: "cover_image", maxCount: 1 },
  ]),
  validate(
    Joi.object({
      id: Joi.number().optional(),
  
      name: Joi.string().required(),
      slug: Joi.string().allow("").optional(),
  
      city_id: Joi.number().optional(),
      cuisine_id: Joi.number().optional(),
  
      whatsapp_phone: Joi.string().allow("").optional(),
      address: Joi.string().allow("").optional(),
      latitude: Joi.number().optional(),
      longitude: Joi.number().optional(),
      max_delivery_distance: Joi.number().optional(),
  
      owner_name: Joi.string().allow("").optional(),
      owner_email: Joi.string().allow("").optional(),
      owner_phone: Joi.string().allow("").optional(),
  
      account_name: Joi.string().allow("").optional(),
      account_email: Joi.string().allow("").optional(),
      account_password: Joi.string().allow("",null).optional(),  // FIXED
  
      opening_time: Joi.string().allow("").optional(),
      closing_time: Joi.string().allow("").optional(),
      min_food_processing_time: Joi.string().allow("").optional(),
      max_food_processing_time: Joi.string().allow("").optional(),
      time_slot_seprated: Joi.string().allow("").optional(),
  
      tags: Joi.string().allow("").optional(),
      is_featured: Joi.boolean().optional(),
      pickup_order: Joi.boolean().optional(),
      delivery_order: Joi.boolean().optional(),
      approval_status: Joi.string().valid("pending", "approved", "rejected").optional(),
      is_trusted: Joi.boolean().optional(),
    })
   ),
  addOrEditRestaurant
);

router.get(
  "/getRestaurant",
  authenticateToken,
  validate(
    Joi.object({
      page: Joi.number().optional(),
      limit: Joi.number().optional(),
      search: Joi.string().optional().allow("",null),
      status: Joi.string().optional(),
    })
  ),
  getRestaurant
);

router.post(
  "/deleteRestaurant",
  authenticateToken,
  validate(
    Joi.object({
      id: Joi.number().required(),
    })
  ),
  deleteRestaurant
);



export default router;
