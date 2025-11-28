import models from "../../../models/index.js";
const { Op } = models.Sequelize;
import { deleteFile } from "../../../utils/fileUtils.js";

const normalizeSlug = (value) => {
  if (value === undefined || value === null) return undefined;
  const trimmed = String(value).trim();
  return trimmed.length ? trimmed : undefined;
};

const normalizeStatus = (value, fallback = "active") => {
  if (value === undefined || value === null || value === "") return fallback;
  const lowered = String(value).toLowerCase();
  if (["active", "inactive"].includes(lowered)) {
    return lowered;
  }
  if (["true", "1", "yes", "enable", "enabled", "on", "public"].includes(lowered)) {
    return "active";
  }
  if (["false", "0", "no", "disable", "disabled", "off", "private"].includes(lowered)) {
    return "inactive";
  }
  return fallback;
};

// ==================== BLOG CATEGORY ====================

export const addOrEditBlogCategory = async (req, res) => {
  try {
    const { id, name } = req.body;
    const slugInput = normalizeSlug(req.body.slug);
    const visibilityStatus = normalizeStatus(req.body.visibility_status, "active");

    if (!name) {
      return res.json({ status: false, message: "Name is required" });
    }

    if (id) {
      // Update existing category
      const existing = await models.BlogCategory.findOne({ where: { id } });
      if (!existing) {
        return res.json({ status: false, message: "Blog category not found" });
      }

      // Check if slug already exists (excluding current record)
      if (slugInput) {
        const slugExists = await models.BlogCategory.findOne({
          where: {
            slug: slugInput,
            id: { [Op.ne]: id },
          },
        });
        if (slugExists) {
          return res.json({ status: false, message: "Slug already exists" });
        }
      }

      await existing.update({
        name,
        slug: slugInput !== undefined ? slugInput : existing.slug,
        visibility_status: visibilityStatus,
      });

      return res.json({
        status: true,
        message: "Blog category updated successfully",
      });
    }

    // Create new category
    // Check if slug already exists
    if (slugInput) {
      const slugExists = await models.BlogCategory.findOne({
        where: { slug: slugInput },
      });
      if (slugExists) {
        return res.json({ status: false, message: "Slug already exists" });
      }
    }

    await models.BlogCategory.create({
      name,
      slug: slugInput,
      visibility_status: visibilityStatus,
    });

    return res.json({
      status: true,
      message: "Blog category added successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

export const getBlogCategoryList = async (req, res) => {
  try {
    const { page, limit, search = "" } = req.query;

    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { slug: { [Op.like]: `%${search}%` } },
      ];
    }

    // If pagination NOT provided → return ALL categories
    if (!page || !limit) {
      const categories = await models.BlogCategory.findAll({
        where,
        order: [["id", "DESC"]],
      });

      return res.json({
        status: true,
        message: "Blog category list fetched",
        total: categories.length,
        page: null,
        limit: null,
        data: categories,
      });
    }

    // Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const offset = (pageNum - 1) * limitNum;

    const { count, rows: categories } = await models.BlogCategory.findAndCountAll({
      where,
      order: [["id", "DESC"]],
      limit: limitNum,
      offset: offset,
    });

    return res.json({
      status: true,
      message: "Blog category list fetched",
      total: count,
      page: pageNum,
      limit: limitNum,
      data: categories,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

export const getSingleBlogCategory = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.json({ status: false, message: "Category ID is required" });
    }

    const category = await models.BlogCategory.findOne({
      where: { id },
    });

    if (!category) {
      return res.json({ status: false, message: "Blog category not found" });
    }

    // Get total blogs count for this category
    const totalBlogs = await models.Blog.count({
      where: { category_id: id },
    });

    return res.json({
      status: true,
      message: "Blog category fetched successfully",
      data: {
        ...category.get({ plain: true }),
        total_blog: totalBlogs,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

export const deleteBlogCategory = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.json({ status: false, message: "Category ID is required" });
    }

    const category = await models.BlogCategory.findOne({ where: { id } });
    if (!category) {
      return res.json({ status: false, message: "Blog category not found" });
    }

    // Check if category has blogs
    const blogCount = await models.Blog.count({
      where: { category_id: id },
    });

    if (blogCount > 0) {
      return res.json({
        status: false,
        message: `Cannot delete category. It has ${blogCount} blog(s) associated with it.`,
      });
    }

    await category.destroy();

    return res.json({
      status: true,
      message: "Blog category deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

// ==================== BLOG ====================

export const addOrEditBlog = async (req, res) => {
  try {
    const {
      id,
      title,
      category_id,
      description,
      visibility_status,
      tags,
      seo_title,
      seo_description,
    } = req.body;
    const slugInput = normalizeSlug(req.body.slug);
    const image = req.file?.path || null;

    if (!title) {
      return res.json({ status: false, message: "Title is required" });
    }

    if (!category_id) {
      return res.json({ status: false, message: "Category is required" });
    }

    // Check if category exists
    const category = await models.BlogCategory.findOne({
      where: { id: category_id },
    });
    if (!category) {
      return res.json({ status: false, message: "Blog category not found" });
    }

    const visibilityStatus = normalizeStatus(visibility_status, "active");

    if (id) {
      // Update existing blog
      const existing = await models.Blog.findOne({ where: { id } });
      if (!existing) {
        return res.json({ status: false, message: "Blog not found" });
      }

      // Check if slug already exists (excluding current record)
      if (slugInput) {
        const slugExists = await models.Blog.findOne({
          where: {
            slug: slugInput,
            id: { [Op.ne]: id },
          },
        });
        if (slugExists) {
          return res.json({ status: false, message: "Slug already exists" });
        }
      }

      // Handle image update
      let finalImage = existing.image;
      if (image) {
        if (existing.image) {
          await deleteFile(existing.image);
        }
        finalImage = image;
      }

      await existing.update({
        title,
        slug: slugInput !== undefined ? slugInput : existing.slug,
        category_id,
        image: finalImage,
        description: description !== undefined ? description : existing.description,
        visibility_status: visibilityStatus,
        tags: tags !== undefined ? tags : existing.tags,
        seo_title: seo_title !== undefined ? seo_title : existing.seo_title,
        seo_description:
          seo_description !== undefined ? seo_description : existing.seo_description,
      });

      return res.json({
        status: true,
        message: "Blog updated successfully",
      });
    }

    // Create new blog
    // Check if slug already exists
    if (slugInput) {
      const slugExists = await models.Blog.findOne({
        where: { slug: slugInput },
      });
      if (slugExists) {
        return res.json({ status: false, message: "Slug already exists" });
      }
    }

    await models.Blog.create({
      title,
      slug: slugInput,
      category_id,
      image,
      description,
      visibility_status: visibilityStatus,
      tags,
      seo_title,
      seo_description,
    });

    return res.json({
      status: true,
      message: "Blog added successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

export const getBlogList = async (req, res) => {
  try {
    const { page, limit, search = "", category_id, status } = req.query;

    const where = {};

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { slug: { [Op.like]: `%${search}%` } },
      ];
    }

    if (category_id) {
      where.category_id = category_id;
    }

    if (status) {
      where.visibility_status = status;
    }

    // If pagination NOT provided → return ALL blogs
    if (!page || !limit) {
      const blogs = await models.Blog.findAll({
        where,
        include: [
          {
            model: models.BlogCategory,
            as: "category",
            attributes: ["id", "name", "slug"],
          },
        ],
        order: [["id", "DESC"]],
      });

      return res.json({
        status: true,
        message: "Blog list fetched",
        total: blogs.length,
        page: null,
        limit: null,
        data: blogs,
      });
    }

    // Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const offset = (pageNum - 1) * limitNum;

    const { count, rows: blogs } = await models.Blog.findAndCountAll({
      where,
      include: [
        {
          model: models.BlogCategory,
          as: "category",
          attributes: ["id", "name", "slug"],
        },
      ],
      order: [["id", "DESC"]],
      limit: limitNum,
      offset: offset,
    });

    return res.json({
      status: true,
      message: "Blog list fetched",
      total: count,
      page: pageNum,
      limit: limitNum,
      data: blogs,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

export const getSingleBlog = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.json({ status: false, message: "Blog ID is required" });
    }

    const blog = await models.Blog.findOne({
      where: { id },
      include: [
        {
          model: models.BlogCategory,
          as: "category",
          attributes: ["id", "name", "slug"],
        },
      ],
    });

    if (!blog) {
      return res.json({ status: false, message: "Blog not found" });
    }

    return res.json({
      status: true,
      message: "Blog fetched successfully",
      data: blog,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.json({ status: false, message: "Blog ID is required" });
    }

    const blog = await models.Blog.findOne({ where: { id } });
    if (!blog) {
      return res.json({ status: false, message: "Blog not found" });
    }

    // Delete image if exists
    if (blog.image) {
      await deleteFile(blog.image);
    }

    await blog.destroy();

    return res.json({
      status: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

// ==================== BLOG COMMENT ====================

export const getBlogCommentList = async (req, res) => {
  try {
    const { page, limit, search = "", blog_id, status } = req.query;

    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { comment: { [Op.like]: `%${search}%` } },
      ];
    }

    if (blog_id) {
      where.blog_id = blog_id;
    }

    if (status) {
      where.status = status;
    }

    // If pagination NOT provided → return ALL comments
    if (!page || !limit) {
      const comments = await models.BlogComment.findAll({
        where,
        include: [
          {
            model: models.Blog,
            as: "blog",
            attributes: ["id", "title", "slug"],
          },
        ],
        order: [["id", "DESC"]],
      });

      return res.json({
        status: true,
        message: "Blog comment list fetched",
        total: comments.length,
        page: null,
        limit: null,
        data: comments,
      });
    }

    // Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const offset = (pageNum - 1) * limitNum;

    const { count, rows: comments } = await models.BlogComment.findAndCountAll({
      where,
      include: [
        {
          model: models.Blog,
          as: "blog",
          attributes: ["id", "title", "slug"],
        },
      ],
      order: [["id", "DESC"]],
      limit: limitNum,
      offset: offset,
    });

    return res.json({
      status: true,
      message: "Blog comment list fetched",
      total: count,
      page: pageNum,
      limit: limitNum,
      data: comments,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

export const getSingleBlogComment = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.json({ status: false, message: "Comment ID is required" });
    }

    const comment = await models.BlogComment.findOne({
      where: { id },
      include: [
        {
          model: models.Blog,
          as: "blog",
          attributes: ["id", "title", "slug"],
        },
      ],
    });

    if (!comment) {
      return res.json({ status: false, message: "Blog comment not found" });
    }

    return res.json({
      status: true,
      message: "Blog comment fetched successfully",
      data: comment,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

export const updateBlogCommentStatus = async (req, res) => {
  try {
    const { id, status } = req.body;

    if (!id) {
      return res.json({ status: false, message: "Comment ID is required" });
    }

    const normalizedStatus = normalizeStatus(status, "active");

    const comment = await models.BlogComment.findOne({ where: { id } });
    if (!comment) {
      return res.json({ status: false, message: "Blog comment not found" });
    }

    await comment.update({ status: normalizedStatus });

    return res.json({
      status: true,
      message: "Blog comment status updated successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

export const deleteBlogComment = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.json({ status: false, message: "Comment ID is required" });
    }

    const comment = await models.BlogComment.findOne({ where: { id } });
    if (!comment) {
      return res.json({ status: false, message: "Blog comment not found" });
    }

    await comment.destroy();

    return res.json({
      status: true,
      message: "Blog comment deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

