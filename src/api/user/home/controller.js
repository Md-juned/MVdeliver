import models from "../../../models/index.js";
import { Op } from "sequelize";

export const getCategories = async (req, res) => {
  try {
    const categories = await models.FoodCategory.findAll({
      where: { status: "active" },
      attributes: ["id", "name", "image"],
      order: [["id", "ASC"]],
    });

    return res.json({
      status: true,
      message: "Categories fetched successfully",
      data: categories,
    });
  } catch (error) {
    console.error("getCategories error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category_id,
      cuisine_id,
      restaurant_id,
      min_price,
      max_price,
      search,
    } = req.query;

    const userId = req.user?.id || null;

    const where = { status: "active" };

    if (category_id) {
      where.category_id = category_id;
    }

    if (restaurant_id) {
      where.restaurant_id = restaurant_id;
    }

    if (min_price || max_price) {
      where.price = {};
      if (min_price) where.price[Op.gte] = parseFloat(min_price);
      if (max_price) where.price[Op.lte] = parseFloat(max_price);
    }

    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }

    const restaurantWhere = {};
    if (cuisine_id) {
      restaurantWhere.cuisine_id = cuisine_id;
    }

    const include = [
      {
        model: models.Restaurant,
        as: "restaurant",
        attributes: ["id", "name", "logo_image", "city_id", "is_featured", "approval_status"],
        where: Object.keys(restaurantWhere).length > 0 ? restaurantWhere : {},
        required: Object.keys(restaurantWhere).length > 0,
        include: [
          {
            model: models.City,
            as: "city",
            attributes: ["id", "name"],
          },
        ],
      },
      {
        model: models.FoodCategory,
        as: "foodCategory",
        attributes: ["id", "name"],
      },
      {
        model: models.ProductSize,
        as: "sizes",
        attributes: ["id", "size_name", "price"],
      },
      {
        model: models.ProductSpecification,
        as: "specifications",
        attributes: ["id", "name"],
      },
    ];

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: products } = await models.Product.findAndCountAll({
      where,
      include,
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset,
      distinct: true,
    });

    // Get favorite status for each product if user is logged in
    let favoriteProductIds = [];
    if (userId) {
      const favorites = await models.Favorite.findAll({
        where: { user_id: userId },
        attributes: ["product_id"],
      });
      favoriteProductIds = favorites.map((f) => f.product_id);
    }

    const productsWithFavorites = products.map((product) => {
      const productData = product.get({ plain: true });
      productData.is_favorite = favoriteProductIds.includes(product.id);
      return productData;
    });

    return res.json({
      status: true,
      message: "Featured products fetched successfully",
      data: productsWithFavorites,
      pagination: {
        total: count,
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("getFeaturedProducts error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getRestaurants = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      city_id,
      cuisine_id,
      search,
      is_featured,
    } = req.query;

    const where = { approval_status: "approved" };

    if (city_id) {
      where.city_id = city_id;
    }

    if (cuisine_id) {
      where.cuisine_id = cuisine_id;
    }

    if (is_featured !== undefined) {
      where.is_featured = is_featured === "true";
    }

    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }

    const include = [
      {
        model: models.City,
        as: "city",
        attributes: ["id", "name"],
      },
      {
        model: models.Cuisine,
        as: "cuisine",
        attributes: ["id", "name", "image"],
      },
    ];

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: restaurants } = await models.Restaurant.findAndCountAll({
      where,
      include,
      attributes: [
        "id",
        "name",
        "logo_image",
        "cover_image",
        "address",
        "latitude",
        "longitude",
        "is_featured",
        "is_trusted",
        "approval_status",
        "city_id",
        "cuisine_id",
      ],
      order: [["is_featured", "DESC"], ["created_at", "DESC"]],
      limit: parseInt(limit),
      offset,
      distinct: true,
    });

    return res.json({
      status: true,
      message: "Restaurants fetched successfully",
      data: restaurants,
      pagination: {
        total: count,
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("getRestaurants error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getCuisines = async (req, res) => {
  try {
    const cuisines = await models.Cuisine.findAll({
      where: { status: "active" },
      attributes: ["id", "name", "image"],
      order: [["id", "ASC"]],
    });

    // Get restaurant count for each cuisine
    const cuisinesWithCount = await Promise.all(
      cuisines.map(async (cuisine) => {
        const restaurantCount = await models.Restaurant.count({
          where: {
            cuisine_id: cuisine.id,
            approval_status: "approved",
          },
        });

        return {
          id: cuisine.id,
          name: cuisine.name,
          image: cuisine.image,
          restaurant_count: restaurantCount,
        };
      })
    );

    return res.json({
      status: true,
      message: "Cuisines fetched successfully",
      data: cuisinesWithCount,
    });
  } catch (error) {
    console.error("getCuisines error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
