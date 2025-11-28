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
      categoryId,
      cuisine_id,
      cuisineId,
      restaurant_id,
      restaurantId,
      min_price,
      minPrice,
      max_price,
      maxPrice,
      search,
    } = req.query;

    const normalizedCategoryId = category_id ?? categoryId;
    const normalizedCuisineId = cuisine_id ?? cuisineId;
    const normalizedRestaurantId = restaurant_id ?? restaurantId;
    const normalizedMinPrice = min_price ?? minPrice;
    const normalizedMaxPrice = max_price ?? maxPrice;

    // Get user ID if authenticated (optional authentication)
    const userId = req.user?.id || null;

    const where = { status: "active" };

    if (normalizedCategoryId) {
      where.category_id = normalizedCategoryId;
    }

    if (normalizedRestaurantId) {
      where.restaurant_id = normalizedRestaurantId;
    }

    if (normalizedMinPrice || normalizedMaxPrice) {
      where.price = {};
      if (normalizedMinPrice) where.price[Op.gte] = parseFloat(normalizedMinPrice);
      if (normalizedMaxPrice) where.price[Op.lte] = parseFloat(normalizedMaxPrice);
    }

    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }

    if (normalizedCuisineId) {
      where["$restaurant.cuisine_id$"] = normalizedCuisineId;
    }

    const include = [
      {
        model: models.Restaurant,
        as: "restaurant",
        required: !!normalizedCuisineId,
        include: [
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
      subQuery: false,
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

    // Always include is_favorite field in response (false if user not logged in or product not favorited)
    const productsWithFavorites = products.map((product) => {
      const productData = product.get({ plain: true });
      // Set is_favorite: true if product is in user's favorites, false otherwise
      productData.is_favorite = userId ? favoriteProductIds.includes(product.id) : false;
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

export const getPopularProducts = async (req, res) => {
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
        attributes: [
          "id",
          "name",
          "logo_image",
          "city_id",
          "cuisine_id",
          "is_featured",
          "approval_status",
        ],
        where: Object.keys(restaurantWhere).length > 0 ? restaurantWhere : {},
        required: Object.keys(restaurantWhere).length > 0,
        include: [
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

    const favoriteCountLiteral = models.Sequelize.literal(
      "(SELECT COUNT(*) FROM favorites AS fav WHERE fav.product_id = Product.id)"
    );

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: products } = await models.Product.findAndCountAll({
      where,
      include,
      attributes: {
        include: [[favoriteCountLiteral, "favorite_count"]],
      },
      order: [
        [models.Sequelize.literal("favorite_count"), "DESC"],
        ["created_at", "DESC"],
      ],
      limit: parseInt(limit),
      offset,
      distinct: true,
    });

    let favoriteProductIds = [];
    if (userId) {
      const favorites = await models.Favorite.findAll({
        where: { user_id: userId },
        attributes: ["product_id"],
      });
      favoriteProductIds = favorites.map((f) => f.product_id);
    }

    const productsWithMeta = products.map((product) => {
      const productData = product.get({ plain: true });
      productData.favorite_count = parseInt(productData.favorite_count, 10) || 0;
      productData.is_favorite = userId ? favoriteProductIds.includes(product.id) : false;
      return productData;
    });

    return res.json({
      status: true,
      message: "Popular products fetched successfully",
      data: productsWithMeta,
      pagination: {
        total: count,
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("getPopularProducts error:", error);
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

export const getAddons = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      restaurant_id,
      status,
      search,
    } = req.query;

    const where = {};

    if (restaurant_id) {
      where.restaurant_id = restaurant_id;
    }

    if (status) {
      where.status = status;
    } else {
      // Default to active if status field exists
      where.status = "active";
    }

    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await models.Addon.findAndCountAll({
      where,
      attributes: ["id", "restaurant_id", "name", "price", "status"],
      order: [["id", "ASC"]],
      limit: parseInt(limit),
      offset,
    });

    const addons = rows.map((addon) => addon.get({ plain: true }));

    return res.json({
      status: true,
      message: "Addons fetched successfully",
      data: addons,
      pagination: {
        total: count,
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("getAddons error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getProductSizes = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      product_id,
      search,
    } = req.query;

    const where = {};

    if (product_id) {
      where.product_id = product_id;
    }

    if (search) {
      where.size_name = { [Op.like]: `%${search}%` };
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await models.ProductSize.findAndCountAll({
      where,
      attributes: ["id", "product_id", "size_name", "price"],
      order: [["id", "ASC"]],
      limit: parseInt(limit),
      offset,
      include: [
        {
          model: models.Product,
          as: "product",
          attributes: ["id", "name", "image"],
        },
      ],
    });

    const productSizes = rows.map((size) => size.get({ plain: true }));

    return res.json({
      status: true,
      message: "Product sizes fetched successfully",
      data: productSizes,
      pagination: {
        total: count,
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("getProductSizes error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
