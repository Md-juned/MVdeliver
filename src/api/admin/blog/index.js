import express from "express";
import Joi from "joi";
import { validate } from "../../../common/middleware/validation.middleware.js";
import {
  addOrEditBlogCategory,
  getBlogCategoryList,
  getSingleBlogCategory,
  deleteBlogCategory,
  addOrEditBlog,
  getBlogList,
  getSingleBlog,
  deleteBlog,
  getBlogCommentList,
  getSingleBlogComment,
  updateBlogCommentStatus,
  deleteBlogComment,
} from "./controller.js";
import { authenticateToken } from "../../../common/middleware/jwtToken.middleware.js";
import upload from "../../../utils/multer.js";

const router = express.Router();

// ==================== BLOG CATEGORY ====================

router.post(
  "/addOrEditBlogCategory",
  authenticateToken,
  validate(
    Joi.object({
      id: Joi.number().optional(),
      name: Joi.string().required(),
      slug: Joi.string().optional().allow("", null),
      visibility_status: Joi.string()
        .optional()
        .valid("active", "inactive", "public", "private"),
    })
  ),
  addOrEditBlogCategory
);

router.get(
  "/getBlogCategoryList",
  authenticateToken,
  validate(
    Joi.object({
      page: Joi.number().optional(),
      limit: Joi.number().optional(),
      search: Joi.string().optional().allow("", null),
    })
  ),
  getBlogCategoryList
);

router.get(
  "/getSingleBlogCategory",
  authenticateToken,
  validate(
    Joi.object({
      id: Joi.number().required(),
    })
  ),
  getSingleBlogCategory
);

router.post(
  "/deleteBlogCategory",
  authenticateToken,
  validate(
    Joi.object({
      id: Joi.number().required(),
    })
  ),
  deleteBlogCategory
);

// ==================== BLOG ====================

router.post(
  "/addOrEditBlog",
  authenticateToken,
  upload("blogs").single("image"),
  validate(
    Joi.object({
      id: Joi.number().optional(),
      title: Joi.string().required(),
      slug: Joi.string().optional().allow("", null),
      category_id: Joi.number().required(),
      description: Joi.string().optional().allow("", null),
      visibility_status: Joi.string()
        .optional()
        .valid("active", "inactive", "public", "private"),
      tags: Joi.string().optional().allow("", null),
      seo_title: Joi.string().optional().allow("", null),
      seo_description: Joi.string().optional().allow("", null),
    })
  ),
  addOrEditBlog
);

router.get(
  "/getBlogList",
  authenticateToken,
  validate(
    Joi.object({
      page: Joi.number().optional(),
      limit: Joi.number().optional(),
      search: Joi.string().optional().allow("", null),
      category_id: Joi.number().optional(),
      status: Joi.string().optional().valid("active", "inactive"),
    })
  ),
  getBlogList
);

router.get(
  "/getSingleBlog",
  authenticateToken,
  validate(
    Joi.object({
      id: Joi.number().required(),
    })
  ),
  getSingleBlog
);

router.post(
  "/deleteBlog",
  authenticateToken,
  validate(
    Joi.object({
      id: Joi.number().required(),
    })
  ),
  deleteBlog
);

// ==================== BLOG COMMENT ====================

router.get(
  "/getBlogCommentList",
  authenticateToken,
  validate(
    Joi.object({
      page: Joi.number().optional(),
      limit: Joi.number().optional(),
      search: Joi.string().optional().allow("", null),
      blog_id: Joi.number().optional(),
      status: Joi.string().optional().valid("active", "inactive"),
    })
  ),
  getBlogCommentList
);

router.get(
  "/getSingleBlogComment",
  authenticateToken,
  validate(
    Joi.object({
      id: Joi.number().required(),
    })
  ),
  getSingleBlogComment
);

router.post(
  "/updateBlogCommentStatus",
  authenticateToken,
  validate(
    Joi.object({
      id: Joi.number().required(),
      status: Joi.string().required().valid("active", "inactive"),
    })
  ),
  updateBlogCommentStatus
);

router.post(
  "/deleteBlogComment",
  authenticateToken,
  validate(
    Joi.object({
      id: Joi.number().required(),
    })
  ),
  deleteBlogComment
);

export default router;

