import models from "../../../models/index.js";
const { Op } = models.Sequelize;
import { deleteFile } from "../../../utils/fileUtils.js";

const normalizeSlug = (value) => {
  if (value === undefined || value === null) return undefined;
  const trimmed = String(value).trim();
  return trimmed.length ? trimmed : undefined;
};

// ---- Cuisine ----

export const addOrEditCuisine = async (req, res) => {
  try {
    const { id, name, status } = req.body;
    const slugInput = normalizeSlug(req.body.slug);
    const image = req.file?.path || null;

    if (id) {
      // Find existing
      const existing = await models.Cuisine.findOne({ where: { id } });
      if (!existing) {
        return res.json({ status: false, message: "Cuisine not found" });
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

      // Update with fallback
      const updatePayload = {
        name: name ?? existing.name,
        image: finalImage,
        status: status ? status : existing.status,
      };

      if (slugInput !== undefined) {
        updatePayload.slug = slugInput;
      }

      await existing.update(updatePayload);

      return res.json({
        status: true,
        message: "Cuisine updated successfully",
      });
    }

    // Create new
    await models.Cuisine.create({
      name,
      image,
      slug: slugInput,
    });

    return res.json({
      status: true,
      message: "Cuisine added successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

export const getCuisineList = async (req, res) => {
  try {
    const { page, limit, search = "", status } = req.query;

    const where = {};

    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }

    if (status) {
      where.status = status;
    }

    // 👉 If pagination NOT provided → return ALL cuisines
    if (!page || !limit) {
      const cuisines = await models.Cuisine.findAll({
        where,
        order: [["id", "DESC"]],
      });

      return res.json({
        status: true,
        message: "Cuisine list fetched",
        total: cuisines.length,
        page: null,
        limit: null,
        data: cuisines,
      });
    }

    // 👉 Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const { rows, count } = await models.Cuisine.findAndCountAll({
      where,
      limit: limitNum,
      offset,
      order: [["id", "DESC"]],
    });

    return res.json({
      status: true,
      message: "Cuisine list fetched",
      total: count,
      page: pageNum,
      limit: limitNum,
      data: rows,
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

export const deleteCuisine = async (req, res) => {
  try {
    const { id } = req.body;

    await models.Cuisine.destroy({ where: { id } });

    return res.json({
      status: true,
      message: "Cuisine deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

// ---- City ----

export const addOrEditCity = async (req, res) => {
  try {
    const { id, name, status } = req.body;
    const image = req.file?.path || null;

    if (id) {
      // Find existing
      const existing = await models.City.findOne({ where: { id } });
      if (!existing) {
        return res.json({ status: false, message: "City not found" });
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

      // Update with fallback
      await existing.update({
        name: name ?? existing.name,
        image: finalImage,
      });

      return res.json({
        status: true,
        message: "City updated successfully",
      });
    }

    // Create new
    await models.City.create({
      name,
      image,
    });

    return res.json({
      status: true,
      message: "City added successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

export const getCity = async (req, res) => {
  try {
    const { page, limit, search = "" } = req.query;

    const where = {};

    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }

    // 👉 If pagination NOT provided → return ALL cities
    if (!page || !limit) {
      const cities = await models.City.findAll({
        where,
        order: [["id", "DESC"]],
      });

      return res.json({
        status: true,
        message: "City list fetched",
        total: cities.length,
        page: null,
        limit: null,
        data: cities,
      });
    }

    // 👉 Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const { rows, count } = await models.City.findAndCountAll({
      where,
      limit: limitNum,
      offset,
      order: [["id", "DESC"]],
    });

    return res.json({
      status: true,
      message: "City list fetched",
      total: count,
      page: pageNum,
      limit: limitNum,
      data: rows,
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

export const deleteCity = async (req, res) => {
  try {
    const { id } = req.body;

    await models.City.destroy({ where: { id } });

    return res.json({
      status: true,
      message: "City deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

// ---- Restaurant ----

export const addOrEditRestaurant = async (req, res) => {
  try {
    const data = { ...req.body };
    const slugInput = normalizeSlug(data.slug);

    if (slugInput !== undefined) {
      data.slug = slugInput;
    } else {
      delete data.slug;
    }

    let result;
    let oldRestaurant = null;

    if (data.id) {
      // Update - fetch existing restaurant first
      oldRestaurant = await models.Restaurant.findByPk(data.id);
      if (!oldRestaurant) {
        return res.json({ status: false, message: "Restaurant not found" });
      }

      // Handle images - only update if new images are provided
      if (req.files?.logo_image?.length) {
        if (oldRestaurant.logo_image) {
          await deleteFile(oldRestaurant.logo_image);
        }
        data.logo_image = req.files.logo_image[0].path;
      } else {
        delete data.logo_image;
      }

      if (req.files?.cover_image?.length) {
        if (oldRestaurant.cover_image) {
          await deleteFile(oldRestaurant.cover_image);
        }
        data.cover_image = req.files.cover_image[0].path;
      } else {
        delete data.cover_image;
      }

      // Remove id from update data
      const updateData = { ...data };
      delete updateData.id;

      // Remove undefined, empty string, or null fields so they don't update
      Object.keys(updateData).forEach((key) => {
        if (
          updateData[key] === undefined ||
          updateData[key] === "" ||
          updateData[key] === null
        ) {
          delete updateData[key];
        }
      });

      await models.Restaurant.update(updateData, { where: { id: data.id } });
      result = await models.Restaurant.findByPk(data.id);

      return res.json({
        status: true,
        message: "Restaurant updated successfully",
        data: result,
      });
    } else {
      // Create - handle images for new restaurant
      if (req.files?.logo_image?.length) {
        data.logo_image = req.files.logo_image[0].path;
      }

      if (req.files?.cover_image?.length) {
        data.cover_image = req.files.cover_image[0].path;
      }

      result = await models.Restaurant.create(data);
    }

    return res.json({
      status: true,
      message: "Restaurant create successfully",
      data: result,
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};


export const getRestaurant = async (req, res) => {
  try {
    const { page, limit, search, city_id, cuisine_id, status } = req.query;

    const where = {};

    // 🔍 Search by name
    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }

    // 🔍 Filters
    if (city_id) where.city_id = city_id;
    if (cuisine_id) where.cuisine_id = cuisine_id;
    if (status) where.approval_status = status;

    // 👉 If NO pagination → return all restaurants
    if (!page || !limit) {
      const restaurants = await models.Restaurant.findAll({
        where,
        include: [
          {
            model: models.City,
            as: "city",
            attributes: ["id", "name"],
          },
          {
            model: models.Cuisine,
            as: "cuisine",
            attributes: ["id", "name"],
          },
        ],
        order: [["id", "DESC"]],
      });

      return res.json({
        status: true,
        message: "Restaurant list fetched",
        total: restaurants.length,
        page: null,
        limit: null,
        data: restaurants,
      });
    }

    // 👉 Pagination mode
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const result = await models.Restaurant.findAndCountAll({
      where,
      limit: limitNum,
      offset,
      include: [
        {
          model: models.City,
          as: "city",
          attributes: ["id", "name"],
        },
        {
          model: models.Cuisine,
          as: "cuisine",
          attributes: ["id", "name"],
        },
      ],
      order: [["id", "DESC"]],
    });

    return res.json({
      status: true,
      message: "Restaurant list fetched",
      data: result.rows,
      total: result.count,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(result.count / limitNum),
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};

export const deleteRestaurant = async (req, res) => {
  try {
    await models.Restaurant.destroy({
      where: { id: req.body.id },
    });

    return res.json({
      status: true,
      message: "Restaurant deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};

