import models from "../../../models/index.js";

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
    const { limit = 6 } = req.query;

    const products = await models.Product.findAll({
      where: { status: "active" },
      attributes: ["id", "name", "image", "price", "offer_price", "short_description"],
      include: [
        {
          model: models.Restaurant,
          as: "restaurant",
          attributes: ["id", "name", "city_id", "is_featured", "approval_status"],
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
      ],
      order: [["created_at", "DESC"]],
      limit: Number(limit) || 6,
    });

    return res.json({
      status: true,
      message: "Featured products fetched successfully",
      data: products,
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
