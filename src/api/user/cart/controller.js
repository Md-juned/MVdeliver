import models from "../../../models/index.js";

export const addToCart = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { product_id, quantity = 1 } = req.body;

    if (!product_id) {
      return res.status(400).json({
        status: false,
        message: "Product ID is required",
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        status: false,
        message: "Quantity must be at least 1",
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

    // Check if item already exists in cart
    const existingCartItem = await models.Cart.findOne({
      where: { user_id, product_id },
    });

    if (existingCartItem) {
      // Update quantity
      await existingCartItem.update({
        quantity: existingCartItem.quantity + parseInt(quantity),
      });
      return res.json({
        status: true,
        message: "Cart updated successfully",
        data: existingCartItem,
      });
    } else {
      // Add new item to cart
      const cartItem = await models.Cart.create({
        user_id,
        product_id,
        quantity: parseInt(quantity),
      });
      return res.json({
        status: true,
        message: "Product added to cart",
        data: cartItem,
      });
    }
  } catch (error) {
    console.error("addToCart error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getCart = async (req, res) => {
  try {
    const user_id = req.user.id;

    const cartItems = await models.Cart.findAll({
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
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    let total = 0;
    const cartData = cartItems.map((item) => {
      const product = item.product.get({ plain: true });
      const itemPrice = product.offer_price || product.price;
      const itemTotal = itemPrice * item.quantity;
      total += itemTotal;
      return {
        id: item.id,
        product_id: product.id,
        product_name: product.name,
        product_image: product.image,
        price: itemPrice,
        quantity: item.quantity,
        subtotal: itemTotal,
        restaurant: product.restaurant,
      };
    });

    return res.json({
      status: true,
      message: "Cart fetched successfully",
      data: {
        items: cartData,
        total: total.toFixed(2),
        item_count: cartItems.length,
      },
    });
  } catch (error) {
    console.error("getCart error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { cart_id, quantity } = req.body;

    if (!cart_id || !quantity) {
      return res.status(400).json({
        status: false,
        message: "Cart ID and quantity are required",
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        status: false,
        message: "Quantity must be at least 1",
      });
    }

    const cartItem = await models.Cart.findOne({
      where: { id: cart_id, user_id },
    });

    if (!cartItem) {
      return res.status(404).json({
        status: false,
        message: "Cart item not found",
      });
    }

    await cartItem.update({ quantity: parseInt(quantity) });

    return res.json({
      status: true,
      message: "Cart item updated successfully",
      data: cartItem,
    });
  } catch (error) {
    console.error("updateCartItem error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { cart_id } = req.body;

    if (!cart_id) {
      return res.status(400).json({
        status: false,
        message: "Cart ID is required",
      });
    }

    const cartItem = await models.Cart.findOne({
      where: { id: cart_id, user_id },
    });

    if (!cartItem) {
      return res.status(404).json({
        status: false,
        message: "Cart item not found",
      });
    }

    await cartItem.destroy();

    return res.json({
      status: true,
      message: "Item removed from cart",
    });
  } catch (error) {
    console.error("removeFromCart error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

