import models from "../../../models/index.js";

export const addToCart = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { product_id, size_id, quantity = 1, addons = [] } = req.body;

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

    // Validate size if provided
    if (size_id) {
      const size = await models.ProductSize.findOne({
        where: { id: size_id, product_id },
      });
      if (!size) {
        return res.status(404).json({
          status: false,
          message: "Invalid size for this product",
        });
      }
    }

    // Validate addons if provided
    if (addons && addons.length > 0) {
      for (const addonItem of addons) {
        if (!addonItem.addon_id || !addonItem.quantity || addonItem.quantity < 1) {
          return res.status(400).json({
            status: false,
            message: "Each addon must have addon_id and quantity >= 1",
          });
        }

        // Check if addon exists and is available for this product
        const productAddon = await models.ProductAddon.findOne({
          where: { product_id, addon_id: addonItem.addon_id },
        });
        if (!productAddon) {
          return res.status(404).json({
            status: false,
            message: `Addon ${addonItem.addon_id} is not available for this product`,
          });
        }
      }
    }

    // Check if same cart item exists (same product, size, and addons)
    // For simplicity, we'll check if product and size match, then update addons
    const existingCartItem = await models.Cart.findOne({
      where: { user_id, product_id, size_id: size_id || null },
      include: [
        {
          model: models.CartAddon,
          as: "addons",
        },
      ],
    });

    if (existingCartItem) {
      // Check if addons match
      const existingAddonIds = existingCartItem.addons
        .map((a) => a.addon_id)
        .sort()
        .join(",");
      const newAddonIds = addons
        .map((a) => a.addon_id)
        .sort()
        .join(",");

      if (existingAddonIds === newAddonIds) {
        // Same item, update quantity
        await existingCartItem.update({
          quantity: existingCartItem.quantity + parseInt(quantity),
        });
        return res.json({
          status: true,
          message: "Cart updated successfully",
          data: existingCartItem,
        });
      }
    }

    // Create new cart item
    const cartItem = await models.Cart.create({
      user_id,
      product_id,
      size_id: size_id || null,
      quantity: parseInt(quantity),
    });

    // Add addons
    if (addons && addons.length > 0) {
      const cartAddons = addons.map((addonItem) => ({
        cart_id: cartItem.id,
        addon_id: addonItem.addon_id,
        quantity: parseInt(addonItem.quantity),
      }));
      await models.CartAddon.bulkCreate(cartAddons);
    }

    return res.json({
      status: true,
      message: "Product added to cart",
      data: cartItem,
    });
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
        {
          model: models.ProductSize,
          as: "size",
          attributes: ["id", "size_name", "price"],
        },
        {
          model: models.CartAddon,
          as: "addons",
          include: [
            {
              model: models.Addon,
              as: "addon",
              attributes: ["id", "name", "price"],
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    let total = 0;
    const cartData = cartItems.map((item) => {
      const product = item.product.get({ plain: true });
      
      // Base price (use offer_price if available, else regular price)
      let basePrice = parseFloat(product.offer_price || product.price);
      
      // Add size price if size is selected
      if (item.size) {
        basePrice = parseFloat(item.size.price || basePrice);
      }

      // Calculate addons total
      let addonsTotal = 0;
      const addonsData = item.addons.map((cartAddon) => {
        const addon = cartAddon.addon.get({ plain: true });
        const addonPrice = parseFloat(addon.price || 0);
        const addonQuantity = cartAddon.quantity;
        const addonSubtotal = addonPrice * addonQuantity;
        addonsTotal += addonSubtotal;
        
        return {
          id: addon.id,
          name: addon.name,
          price: addonPrice,
          quantity: addonQuantity,
          subtotal: addonSubtotal.toFixed(2),
        };
      });

      // Calculate item subtotal: (base price + addons) * quantity
      const itemSubtotal = (basePrice + addonsTotal) * item.quantity;
      total += itemSubtotal;

      return {
        id: item.id,
        product_id: product.id,
        product_name: product.name,
        product_image: product.image,
        product_description: product.short_description,
        size: item.size
          ? {
              id: item.size.id,
              name: item.size.size_name,
              price: parseFloat(item.size.price || 0).toFixed(2),
            }
          : null,
        base_price: basePrice.toFixed(2),
        addons: addonsData,
        quantity: item.quantity,
        subtotal: itemSubtotal.toFixed(2),
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
    const { cart_id, size_id, quantity, addons } = req.body;

    if (!cart_id) {
      return res.status(400).json({
        status: false,
        message: "Cart ID is required",
      });
    }

    const cartItem = await models.Cart.findOne({
      where: { id: cart_id, user_id },
      include: [
        {
          model: models.CartAddon,
          as: "addons",
        },
        {
          model: models.Product,
          as: "product",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!cartItem) {
      return res.status(404).json({
        status: false,
        message: "Cart item not found",
      });
    }

    // Validate size if provided
    if (size_id !== undefined) {
      if (size_id !== null) {
        const size = await models.ProductSize.findOne({
          where: { id: size_id, product_id: cartItem.product_id },
        });
        if (!size) {
          return res.status(404).json({
            status: false,
            message: "Invalid size for this product",
          });
        }
      }
      // Update size_id (can be null to remove size)
      await cartItem.update({ size_id: size_id || null });
    }

    // Update quantity if provided
    if (quantity !== undefined) {
      if (quantity < 1) {
        return res.status(400).json({
          status: false,
          message: "Quantity must be at least 1",
        });
      }
      await cartItem.update({ quantity: parseInt(quantity) });
    }

    // Update addons if provided
    if (addons && Array.isArray(addons)) {
      // Delete existing addons
      await models.CartAddon.destroy({
        where: { cart_id },
      });

      // Add new addons
      if (addons.length > 0) {
        // Validate addons belong to the product
        for (const addonItem of addons) {
          if (!addonItem.addon_id || !addonItem.quantity || addonItem.quantity < 1) {
            return res.status(400).json({
              status: false,
              message: "Each addon must have addon_id and quantity >= 1",
            });
          }

          const productAddon = await models.ProductAddon.findOne({
            where: { product_id: cartItem.product_id, addon_id: addonItem.addon_id },
          });
          if (!productAddon) {
            return res.status(404).json({
              status: false,
              message: `Addon ${addonItem.addon_id} is not available for this product`,
            });
          }
        }

        const cartAddons = addons
          .filter((a) => a.addon_id && a.quantity >= 1)
          .map((addonItem) => ({
            cart_id: cartItem.id,
            addon_id: addonItem.addon_id,
            quantity: parseInt(addonItem.quantity),
          }));
        await models.CartAddon.bulkCreate(cartAddons);
      }
    }

    // Fetch updated cart item with all relations
    const updatedCartItem = await models.Cart.findOne({
      where: { id: cart_id, user_id },
      include: [
        {
          model: models.Product,
          as: "product",
          attributes: ["id", "name", "image", "price", "offer_price"],
        },
        {
          model: models.ProductSize,
          as: "size",
          attributes: ["id", "size_name", "price"],
        },
        {
          model: models.CartAddon,
          as: "addons",
          include: [
            {
              model: models.Addon,
              as: "addon",
              attributes: ["id", "name", "price"],
            },
          ],
        },
      ],
    });

    return res.json({
      status: true,
      message: "Cart item updated successfully",
      data: updatedCartItem,
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

    // CartAddons will be deleted automatically due to CASCADE
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
