import models from "../../../models/index.js";
const { Op } = models.Sequelize;
import { deleteFile } from "../../../utils/fileUtils.js";

const parseBooleanInput = (value, fallback) => {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  const lowered = String(value).toLowerCase();
  if (["true", "1", "yes"].includes(lowered)) return true;
  if (["false", "0", "no"].includes(lowered)) return false;
  return fallback;
};

const normalizeVisibility = (value, fallback = "visible") => {
  if (!value) return fallback;
  const lowered = String(value).toLowerCase();
  return ["visible", "hidden"].includes(lowered) ? lowered : fallback;
};

const normalizeSlug = (value) => {
  if (value === undefined || value === null) return undefined;
  const trimmed = String(value).trim();
  return trimmed.length ? trimmed : undefined;
};


// ---- Food Category ----

export const addOrEditFoodCategory = async (req, res) => {
  try {
    const { id, name, status } = req.body;
    const slugInput = normalizeSlug(req.body.slug);

    const image = req.file?.path || null;

    // ======= EDIT =========
    if (id) {
      const existing = await models.FoodCategory.findOne({ where: { id } });

      if (!existing) {
        return res.json({ status: false, message: "Food category not found" });
      }

      // Handle image update
      let finalImage = existing.image; // Default to existing image
      if (image) {
        // New image uploaded - delete old one
        if (existing.image) {
          await deleteFile(existing.image);
        }
        finalImage = image;
      }

      const updatePayload = {
        name: name ?? existing.name,
        image: finalImage,
        status: status ?? existing.status,
      };

      if (slugInput !== undefined) {
        updatePayload.slug = slugInput;
      }

      await existing.update(updatePayload);

      return res.json({
        status: true,
        message: "Food category updated successfully",
        data: existing,
      });
    }

    // ======= ADD =========
    const newCategory = await models.FoodCategory.create({
      name,
      image,
      slug: slugInput,
      status: status || "active",
    });

    return res.json({
      status: true,
      message: "Food category added successfully",
      data: newCategory,
    });

  } catch (error) {
    console.error("Food Category Error:", error);
    return res.json({ status: false, message: error.message });
  }
};

export const getFoodCategoryList = async (req, res) => {
  try {
    const { page, limit, search = "" } = req.query;

    let where = {};

    // 🔍 Search filter
    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }

    // 👉 If page & limit not provided → return all data
    if (!page || !limit) {
      const categories = await models.FoodCategory.findAll({
        where,
        order: [["id", "DESC"]],
      });

      return res.json({
        status: true,
        message: "Food categories fetched successfully",
        data: categories,
        total: categories.length,
        currentPage: null,
        totalPages: null,
      });
    }

    // 👉 Pagination logic only if params exist
    const offset = (page - 1) * limit;

    const categories = await models.FoodCategory.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["id", "DESC"]],
    });

    return res.json({
      status: true,
      message: "Food categories fetched successfully",
      data: categories.rows,
      total: categories.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(categories.count / limit),
    });

  } catch (error) {
    console.error("Get Food Category Error:", error);
    return res.json({
      status: false,
      message: error.message,
    });
  }
};

export const deleteFoodCategory = async (req, res) => {
  try {
    const { id } = req.body;

    const category = await models.FoodCategory.findOne({ where: { id } });
    if (!category) {
      return res.json({ status: false, message: "Food category not found" });
    }

    await category.destroy();  // Soft delete (paranoid: true)

    return res.json({
      status: true,
      message: "Food category deleted successfully",
    });

  } catch (error) {
    return res.json({ status: false, message: error.message });
  }
};

// ---- Product ----

export const addOrEditProduct = async (req, res) => {
  try {
    // Convert string numbers to actual numbers for multipart/form-data
    const parseNumber = (value) => {
      if (value === undefined || value === null || value === '') return undefined;
      const num = typeof value === 'string' ? parseFloat(value) : value;
      return isNaN(num) ? undefined : num;
    };

    const {
      id,
      name,
      category_id,
      restaurant_id,
      price,
      offer_price,
      short_description,
      status,
      is_featured,
      visibility,
    } = req.body;
    const slugInput = normalizeSlug(req.body.slug);

    // Convert numeric fields
    const parsedCategoryId = parseNumber(category_id);
    const parsedRestaurantId = parseNumber(restaurant_id);
    const parsedPrice = parseNumber(price);
    const parsedOfferPrice = parseNumber(offer_price);

     

    // Helper to safely parse JSON strings or use arrays directly
    const parseField = (field) => {
      if (!field) return [];
      if (Array.isArray(field)) return field;
      if (typeof field === 'string') {
        // Try JSON parse first
        try {
          const parsed = JSON.parse(field);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          // If JSON parse fails, try comma-separated string
          const trimmed = field.trim();
          if (trimmed === '') return [];
          // Check if it's comma-separated
          if (trimmed.includes(',')) {
            return trimmed.split(',').map(item => item.trim()).filter(item => item !== '');
          }
          // Single value
          return [trimmed];
        }
      }
      return [];
    };

    // Helper to parse addon_ids specifically - ensure they're numbers
    const parseAddonIds = (field) => {
      const parsed = parseField(field);
      return parsed
        .map(id => {
          const numId = parseInt(id, 10);
          return isNaN(numId) ? null : numId;
        })
        .filter(id => id !== null);
    };

    const sizesArray = parseField(req.body.sizes);
    const specificationsArray = parseField(req.body.specifications);
    const addonIdsArray = parseAddonIds(req.body.addon_ids);

    let product;
    const normalizedIsFeatured = parseBooleanInput(is_featured, undefined);
    const normalizedVisibility = normalizeVisibility(visibility);

    if (id) {
      // Update existing product
      product = await models.Product.findOne({ where: { id } });
      if (!product) return res.json({ status: false, message: "Product not found" });

      // Handle image update
      let image = product.image; // Default to existing image
      if (req.file) {
        // New image uploaded - delete old one
        if (product.image) {
          await deleteFile(product.image);
        }
        image = req.file.path;
      }

      const updatePayload = {};

      // Only update fields that are provided and valid
      if (name !== undefined && name !== null && name !== '') updatePayload.name = name;
      if (parsedCategoryId !== undefined) updatePayload.category_id = parsedCategoryId;
      if (parsedRestaurantId !== undefined) updatePayload.restaurant_id = parsedRestaurantId;
      if (parsedPrice !== undefined) updatePayload.price = parsedPrice;
      if (image !== undefined) updatePayload.image = image;

      // Only include optional fields if they are provided
      if (parsedOfferPrice !== undefined) updatePayload.offer_price = parsedOfferPrice;
      if (short_description !== undefined && short_description !== null && short_description !== '') {
        updatePayload.short_description = short_description;
      }
      if (status !== undefined && status !== null && status !== '') updatePayload.status = status;
      if (normalizedIsFeatured !== undefined) {
        updatePayload.is_featured = normalizedIsFeatured;
      } else {
        updatePayload.is_featured = product.is_featured;
      }
      if (visibility !== undefined) {
        updatePayload.visibility = normalizedVisibility;
      } else {
        updatePayload.visibility = product.visibility;
      }
      if (slugInput !== undefined) {
        updatePayload.slug = slugInput;
      }

      await product.update(updatePayload);

      // Remove old relations
      await models.ProductSize.destroy({ where: { product_id: id },force: true });
      await models.ProductSpecification.destroy({ where: { product_id: id },force: true });
      await models.ProductAddon.destroy({ where: { product_id: id },force: true });

    } else {
      // Create new product
      const image = req.file ? req.file.path : null;
      
      // Validate required fields
      if (!name) {
        return res.json({ status: false, message: "Product name is required" });
      }
      if (!parsedCategoryId) {
        return res.json({ status: false, message: "Category ID is required and must be a valid number" });
      }
      if (!parsedRestaurantId) {
        return res.json({ status: false, message: "Restaurant ID is required and must be a valid number" });
      }
      if (!parsedPrice) {
        return res.json({ status: false, message: "Price is required and must be a valid number" });
      }
      if (!short_description || short_description.trim() === '') {
        return res.json({ status: false, message: "Short description is required" });
      }
      if (parsedOfferPrice === undefined) {
        return res.json({ status: false, message: "Offer price is required and must be a valid number" });
      }

      product = await models.Product.create({
        name,
        category_id: parsedCategoryId,
        restaurant_id: parsedRestaurantId,
        price: parsedPrice,
        offer_price: parsedOfferPrice,
        short_description,
        slug: slugInput,
        status: status || "active",
        is_featured: normalizedIsFeatured ?? false,
        visibility: normalizedVisibility,
        image,
      });
    }

    // Insert Sizes
    if (sizesArray.length) {
      const sizeRows = sizesArray.map(size => ({
        product_id: product.id,
        size_name: size.size_name,
        price: size.price || 0,
      }));
      await models.ProductSize.bulkCreate(sizeRows);
    }

    // Insert Addons
    if (addonIdsArray && addonIdsArray.length > 0) {
      // addonIdsArray is already parsed and filtered by parseAddonIds
      // Verify that all addon_ids exist in the database
      const existingAddons = await models.Addon.findAll({
        where: { id: { [Op.in]: addonIdsArray } },
        attributes: ['id'],
      });
      
      const existingAddonIds = existingAddons.map(a => a.id);
      
      if (existingAddonIds.length > 0) {
        const addonRows = existingAddonIds.map(addon_id => ({
          product_id: product.id,
          addon_id: parseInt(addon_id, 10),
        }));
        
        await models.ProductAddon.bulkCreate(addonRows);
      }
    }

    // Insert Specifications
    if (specificationsArray.length) {
      const specRows = specificationsArray.map(spec => ({
        product_id: product.id,
        name: spec,
      }));
      await models.ProductSpecification.bulkCreate(specRows);
    }

 

    return res.json({
      status: true,
      message: id ? "Product updated" : "Product added",
      data: product,
    });

  } catch (error) {
    console.log("Product Error:", error);
    
    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => err.message).join(", ");
      return res.json({ 
        status: false, 
        message: `Validation error: ${validationErrors}` 
      });
    }
    
    // Handle Sequelize unique constraint errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.json({ 
        status: false, 
        message: `Unique constraint error: ${error.errors?.[0]?.message || error.message}` 
      });
    }
    
    // Handle other Sequelize errors
    if (error.name === 'SequelizeDatabaseError') {
      return res.json({ 
        status: false, 
        message: `Database error: ${error.message}` 
      });
    }
    
    return res.json({ status: false, message: error.message || "An error occurred while processing the product" });
  }
};

export const getProducts = async (req, res) => {
  try {
    const { page, limit, search = "" } = req.query;

    const where = {};
    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }

    // 👉 If no pagination → return all products
    if (!page || !limit) {
      const products = await models.Product.findAll({
        where,
        include: [
          {
            model: models.FoodCategory,
            as: "foodCategory",
            attributes: ["id", "name"],
          },
          {
            model: models.Restaurant,
            as: "restaurant",
            attributes: ["id", "name"],
          },
          {
            model: models.ProductSize,
            as: "sizes",
            attributes: ["id", "size_name", "price"],
          },
          {
            model: models.ProductAddon,
            as: "addons",
            include: [
              {
                model: models.Addon,
                as: "addon",
                attributes: ["id", "name", "price"],
              },
            ],
          },
          {
            model: models.ProductSpecification,
            as: "specifications",
            attributes: ["id", "name"],
          },
        ],
        order: [["id", "DESC"]],
      });

      return res.json({
        status: true,
        message: "Products fetched successfully",
        data: products,
        total: products.length,
        currentPage: null,
        totalPages: null,
      });
    }

    // 👉 Pagination logic
    const offset = (page - 1) * limit;

    const products = await models.Product.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      include: [
        {
          model: models.FoodCategory,
          as: "foodCategory",
          attributes: ["id", "name"],
        },
        {
          model: models.Restaurant,
          as: "restaurant",
          attributes: ["id", "name"],
        },
        {
          model: models.ProductSize,
          as: "sizes",
          attributes: ["id", "size_name", "price"],
        },
        {
          model: models.ProductAddon,
          as: "addons",
          include: [
            {
              model: models.Addon,
              as: "addon",
              attributes: ["id", "name", "price"],
            },
          ],
        },
        {
          model: models.ProductSpecification,
          as: "specifications",
          attributes: ["id", "name"],
        },
      ],
      order: [["id", "DESC"]],
      distinct: true,
    });

    return res.json({
      status: true,
      message: "Products fetched successfully",
      data: products.rows,
      total: products.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(products.count / limit),
    });

  } catch (error) {
    console.log(error);
    return res.json({ status: false, message: error.message });
  }
};

export const getSingleProduct = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        status: false,
        message: "Product ID is required",
      });
    }

    const product = await models.Product.findOne({
      where: { id },
      include: [
        {
          model: models.FoodCategory,
          as: "foodCategory",
          attributes: ["id", "name"],
        },
        {
          model: models.Restaurant,
          as: "restaurant",
          attributes: ["id", "name"],
        },
        {
          model: models.ProductSize,
          as: "sizes",
          attributes: ["id", "size_name", "price"],
        },
        {
          model: models.ProductAddon,
          as: "addons",
          include: [
            {
              model: models.Addon,
              as: "addon",
              attributes: ["id", "name", "price"],
            },
          ],
        },
        {
          model: models.ProductSpecification,
          as: "specifications",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!product) {
      return res.json({
        status: false,
        message: "Product not found",
      });
    }

    return res.json({
      status: true,
      message: "Product details fetched successfully",
      data: product,
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await models.Product.findOne({ where: { id: req.body.id } });
    if (!product) return res.json({ status: false, message: "Product not found" });

    // 🔥 First delete all related records to avoid FK constraint
    await models.ProductSize.destroy({ where: { product_id: req.body.id }, force: true });
    await models.ProductSpecification.destroy({ where: { product_id: req.body.id }, force: true });
    await models.ProductAddon.destroy({ where: { product_id: req.body.id }, force: true });

    // 🔥 Now delete product
    await models.Product.destroy({ where: { id: req.body.id }});

    return res.json({ status: true, message: "Product deleted successfully" });
  } catch (error) {
    return res.json({ status: false, message: error.message });
  }
};

export const updateProductVisibility = async (req, res) => {
  try {
    const { id, visibility, is_featured } = req.body;

    if (!id) {
      return res.json({ status: false, message: "Product ID is required" });
    }

    const product = await models.Product.findByPk(id);
    if (!product) {
      return res.json({ status: false, message: "Product not found" });
    }

    const updates = {};

    if (visibility) {
      const normalized = normalizeVisibility(visibility, null);
      if (!normalized) {
        return res.json({
          status: false,
          message: "Visibility must be either visible or hidden",
        });
      }
      updates.visibility = normalized;
    }

    if (is_featured !== undefined) {
      updates.is_featured = parseBooleanInput(is_featured, product.is_featured);
    }

    if (!Object.keys(updates).length) {
      return res.json({
        status: false,
        message: "Nothing to update",
      });
    }

    await product.update(updates);

    return res.json({
      status: true,
      message: "Product visibility updated successfully",
      data: product,
    });
  } catch (error) {
    console.log(error);
    return res.json({ status: false, message: error.message });
  }
};

// ---- Addon Product ----


export const addOrEditAddon = async (req, res) => {
  try {

    const restaurant_id = req.body.restaurant_id ? Number(req.body.restaurant_id) : null;
    const { id, name, price, status,  } = req.body;
   // const image = req.file?.path || null;

  //  console.log("-----------------------",req.body)

    let addon;

    if (id) {
      // Update
      addon = await models.Addon.findOne({ where: { id } });
      if (!addon) return res.json({ status: false, message: "Addon not found" });

      const updatePayload = {};
      if (name !== undefined) updatePayload.name = name;
      if (restaurant_id !== undefined) updatePayload.restaurant_id = restaurant_id;
      if (price !== undefined) updatePayload.price = price;
      if (status !== undefined) {
        updatePayload.status = status;
      } else {
        updatePayload.status = addon.status;
      }

      await addon.update(updatePayload);
    } else {
      // Create
      addon = await models.Addon.create({
        name,
        restaurant_id,
        price,
        status: status || "active",
        // image,
      });
    }

    return res.json({
      status: true,
      message: id ? "Addon updated" : "Addon added",
      data: addon,
    });
  } catch (error) {
    console.log(error);
    return res.json({ status: false, message: error.message });
  }
};

export const getAddonList = async (req, res) => {
  try {
    const { page, limit, search = "" } = req.query;

    const where = {};
    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }

    // 👉 If no pagination → return all addons
    if (!page || !limit) {
      const addons = await models.Addon.findAll({
        where,
        include: [
          {
            model: models.Restaurant,
            as: "restaurant",
            attributes: ["id", "name"],
          },
        ],
        order: [["id", "DESC"]],
      });

      return res.json({
        status: true,
        message: "Addon list fetched successfully",
        data: addons,
        total: addons.length,
        currentPage: null,
        totalPages: null,
      });
    }

    // 👉 Pagination
    const offset = (page - 1) * limit;

    const addons = await models.Addon.findAndCountAll({
      where,
      include: [
      {
          model: models.Restaurant,
          as: "restaurant",
          attributes: ["id", "name"],
        },
      ],
      limit: parseInt(limit),
      offset,
      order: [["id", "DESC"]],
    });

    return res.json({
      status: true,
      message: "Addon list fetched successfully",
      data: addons.rows,
      total: addons.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(addons.count / limit),
    });

  } catch (error) {
    console.log(error);
    return res.json({ status: false, message: error.message });
  }
};

export const deleteAddon = async (req, res) => {
  try {
    const addon = await models.Addon.findOne({ where: { id: req.body.id } });
    if (!addon) return res.json({ status: false, message: "Addon not found" });

    // 🔥 Delete related product_addons first to avoid FK constraint
    await models.ProductAddon.destroy({ where: { addon_id: req.body.id }, force: true });

    // 🔥 Delete addon
    await models.Addon.destroy({ where: { id: req.body.id }});

    return res.json({ status: true, message: "Addon deleted successfully" });
  } catch (error) {
    return res.json({ status: false, message: error.message });
  }
};


