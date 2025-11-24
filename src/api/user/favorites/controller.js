import models from "../../../models/index.js";

export const toggleFavorite = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { product_id } = req.body;

    if (!product_id) {
      return res.status(400).json({
        status: false,
        message: "Product ID is required",
      });
    }

    // Check if product exists
    const product = await models.Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({
        status: false,
        message: "Product not found",
      });
    }

    // Check if favorite already exists
    const existingFavorite = await models.Favorite.findOne({
      where: { user_id, product_id },
    });

    if (existingFavorite) {
      // Remove from favorites (dislike)
      await existingFavorite.destroy();
      return res.json({
        status: true,
        message: "Product removed from favorites",
        data: { is_favorite: false },
      });
    } else {
      // Add to favorites (like)
      const favorite = await models.Favorite.create({
        user_id,
        product_id,
      });
      return res.json({
        status: true,
        message: "Product added to favorites",
        data: { is_favorite: true },
      });
    }
  } catch (error) {
    console.error("toggleFavorite error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getFavorites = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: favorites } = await models.Favorite.findAndCountAll({
      where: { user_id },
      include: [
        {
          model: models.Product,
          as: "product",
          attributes: [
            "id",
            "name",
            "image",
            "price",
            "offer_price",
            "short_description",
          ],
          include: [
            {
              model: models.Restaurant,
              as: "restaurant",
              attributes: ["id", "name", "logo_image"],
            },
            {
              model: models.FoodCategory,
              as: "foodCategory",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset,
      distinct: true,
    });

    return res.json({
      status: true,
      message: "Favorites fetched successfully",
      data: favorites.map((f) => ({
        ...f.product.get({ plain: true }),
        is_favorite: true,
      })),
      pagination: {
        total: count,
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("getFavorites error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

