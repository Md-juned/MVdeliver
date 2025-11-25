import models from "../../../models/index.js";
const { Op } = models.Sequelize;

const parseBooleanInput = (value, fallback) => {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  const lowered = String(value).toLowerCase();
  if (["true", "1", "yes"].includes(lowered)) return true;
  if (["false", "0", "no"].includes(lowered)) return false;
  return fallback;
};

// ---- Coupon ----

export const addOrEditCoupon = async (req, res) => {
  try {
    const {
      id,
      name,
      code,
      expired_date,
      min_purchase_price,
      discount_type,
      discount,
      status,
    } = req.body;

    if (id) {
      // Update existing coupon
      const existing = await models.Coupon.findOne({ where: { id } });
      if (!existing) {
        return res.json({ status: false, message: "Coupon not found" });
      }

      // Build update payload - only include fields that are provided
      const updatePayload = {};
      
      if (name !== undefined) updatePayload.name = name;
      if (code !== undefined) {
        // Check if code already exists (excluding current coupon)
        const codeExists = await models.Coupon.findOne({
          where: { code, id: { [Op.ne]: id } },
        });
        if (codeExists) {
          return res.json({ status: false, message: "Coupon code already exists" });
        }
        updatePayload.code = code;
      }
      if (expired_date !== undefined) updatePayload.expired_date = expired_date;
      if (min_purchase_price !== undefined) updatePayload.min_purchase_price = min_purchase_price;
      if (discount_type !== undefined) {
        if (!["amount", "percentage"].includes(discount_type)) {
          return res.json({ status: false, message: "Invalid discount_type. Must be 'amount' or 'percentage'" });
        }
        updatePayload.discount_type = discount_type;
      }
      if (discount !== undefined) updatePayload.discount = discount;
      if (status !== undefined) {
        if (!["active", "inactive"].includes(status)) {
          return res.json({ status: false, message: "Invalid status. Must be 'active' or 'inactive'" });
        }
        updatePayload.status = status;
      }

      await existing.update(updatePayload);

      return res.json({
        status: true,
        message: "Coupon updated successfully",
        data: existing,
      });
    }

    // Create new coupon
    // Check if code already exists
    const codeExists = await models.Coupon.findOne({ where: { code } });
    if (codeExists) {
      return res.json({ status: false, message: "Coupon code already exists" });
    }

    const newCoupon = await models.Coupon.create({
      name,
      code,
      expired_date,
      min_purchase_price: min_purchase_price || 0,
      discount_type: discount_type || "amount",
      discount,
      status: status || "active",
    });

    return res.json({
      status: true,
      message: "Coupon created successfully",
      data: newCoupon,
    });
  } catch (error) {
    console.error("Coupon Error:", error);
    return res.json({ status: false, message: error.message });
  }
};

export const getCouponList = async (req, res) => {
  try {
    const { page, limit, search = "" } = req.query;

    let where = {};

    // Search filter
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { code: { [Op.like]: `%${search}%` } },
      ];
    }

    // If page & limit not provided → return all data
    if (!page || !limit) {
      const coupons = await models.Coupon.findAll({
        where,
        order: [["id", "DESC"]],
      });

      return res.json({
        status: true,
        message: "Coupons fetched successfully",
        data: coupons,
        total: coupons.length,
        currentPage: null,
        totalPages: null,
      });
    }

    // Pagination logic
    const offset = (page - 1) * limit;

    const coupons = await models.Coupon.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["id", "DESC"]],
    });

    return res.json({
      status: true,
      message: "Coupons fetched successfully",
      data: coupons.rows,
      total: coupons.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(coupons.count / limit),
    });
  } catch (error) {
    console.error("Get Coupon List Error:", error);
    return res.json({
      status: false,
      message: error.message,
    });
  }
};

export const getSingleCoupon = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        status: false,
        message: "Coupon ID is required",
      });
    }

    const coupon = await models.Coupon.findOne({
      where: { id },
    });

    if (!coupon) {
      return res.json({
        status: false,
        message: "Coupon not found",
      });
    }

    return res.json({
      status: true,
      message: "Coupon details fetched successfully",
      data: coupon,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.body;

    const coupon = await models.Coupon.findOne({ where: { id } });
    if (!coupon) {
      return res.json({ status: false, message: "Coupon not found" });
    }

    await coupon.destroy(); // Soft delete

    return res.json({
      status: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    return res.json({ status: false, message: error.message });
  }
};

// ---- Offer ----

export const addOrEditOffer = async (req, res) => {
  try {
    const {
      id,
      title,
      description,
      offer_percentage,
      end_time,
      status,
    } = req.body;

    if (id) {
      // Update existing offer
      const existing = await models.Offer.findOne({ where: { id } });
      if (!existing) {
        return res.json({ status: false, message: "Offer not found" });
      }

      // Build update payload - only include fields that are provided
      const updatePayload = {};
      
      if (title !== undefined) updatePayload.title = title;
      if (description !== undefined) updatePayload.description = description;
      if (offer_percentage !== undefined) updatePayload.offer_percentage = offer_percentage;
      if (end_time !== undefined) updatePayload.end_time = end_time;
      if (status !== undefined) {
        if (!["active", "inactive"].includes(status)) {
          return res.json({ status: false, message: "Invalid status. Must be 'active' or 'inactive'" });
        }
        updatePayload.status = status;
      }

      await existing.update(updatePayload);

      return res.json({
        status: true,
        message: "Offer updated successfully",
        data: existing,
      });
    }

    // Create new offer
    const newOffer = await models.Offer.create({
      title,
      description,
      offer_percentage,
      end_time,
      status: status || "active",
    });

    return res.json({
      status: true,
      message: "Offer created successfully",
      data: newOffer,
    });
  } catch (error) {
    console.error("Offer Error:", error);
    return res.json({ status: false, message: error.message });
  }
};

export const getOfferList = async (req, res) => {
  try {
    const { page, limit, search = "" } = req.query;

    let where = {};

    // Search filter
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    // If page & limit not provided → return all data
    if (!page || !limit) {
      const offers = await models.Offer.findAll({
        where,
        order: [["id", "DESC"]],
      });

      return res.json({
        status: true,
        message: "Offers fetched successfully",
        data: offers,
        total: offers.length,
        currentPage: null,
        totalPages: null,
      });
    }

    // Pagination logic
    const offset = (page - 1) * limit;

    const offers = await models.Offer.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["id", "DESC"]],
    });

    return res.json({
      status: true,
      message: "Offers fetched successfully",
      data: offers.rows,
      total: offers.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(offers.count / limit),
    });
  } catch (error) {
    console.error("Get Offer List Error:", error);
    return res.json({
      status: false,
      message: error.message,
    });
  }
};

export const getSingleOffer = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        status: false,
        message: "Offer ID is required",
      });
    }

    const offer = await models.Offer.findOne({
      where: { id },
      include: [
        {
          model: models.OfferProduct,
          as: "offerProducts",
          include: [
            {
              model: models.Product,
              as: "product",
              attributes: ["id", "name", "image", "price", "offer_price"],
            },
          ],
        },
      ],
    });

    if (!offer) {
      return res.json({
        status: false,
        message: "Offer not found",
      });
    }

    return res.json({
      status: true,
      message: "Offer details fetched successfully",
      data: offer,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

export const deleteOffer = async (req, res) => {
  try {
    const { id } = req.body;

    const offer = await models.Offer.findOne({ where: { id } });
    if (!offer) {
      return res.json({ status: false, message: "Offer not found" });
    }

    // Delete related offer products first
    await models.OfferProduct.destroy({ where: { offer_id: id }, force: true });

    await offer.destroy(); // Soft delete

    return res.json({
      status: true,
      message: "Offer deleted successfully",
    });
  } catch (error) {
    return res.json({ status: false, message: error.message });
  }
};

// ---- Offer Product ----

export const addOfferProduct = async (req, res) => {
  try {
    const { offer_id, product_id } = req.body;

    if (!offer_id || !product_id) {
      return res.json({
        status: false,
        message: "Offer ID and Product ID are required",
      });
    }

    // Check if offer exists
    const offer = await models.Offer.findOne({ where: { id: offer_id } });
    if (!offer) {
      return res.json({ status: false, message: "Offer not found" });
    }

    // Check if product exists
    const product = await models.Product.findOne({ where: { id: product_id } });
    if (!product) {
      return res.json({ status: false, message: "Product not found" });
    }

    // Check if product is already in this offer
    const existing = await models.OfferProduct.findOne({
      where: { offer_id, product_id },
    });
    if (existing) {
      return res.json({
        status: false,
        message: "Product is already in this offer",
      });
    }

    const offerProduct = await models.OfferProduct.create({
      offer_id,
      product_id,
    });

    return res.json({
      status: true,
      message: "Product added to offer successfully",
      data: offerProduct,
    });
  } catch (error) {
    console.error("Offer Product Error:", error);
    return res.json({ status: false, message: error.message });
  }
};

export const getOfferProductList = async (req, res) => {
  try {
    const { page, limit, offer_id, search = "" } = req.query;

    let where = {};

    if (offer_id) {
      where.offer_id = offer_id;
    }

    // If page & limit not provided → return all data
    if (!page || !limit) {
      const offerProducts = await models.OfferProduct.findAll({
        where,
        include: [
          {
            model: models.Offer,
            as: "offer",
            attributes: ["id", "title"],
          },
          {
            model: models.Product,
            as: "product",
            attributes: ["id", "name", "image", "price", "offer_price"],
          },
        ],
        order: [["id", "DESC"]],
      });

      return res.json({
        status: true,
        message: "Offer products fetched successfully",
        data: offerProducts,
        total: offerProducts.length,
        currentPage: null,
        totalPages: null,
      });
    }

    // Pagination logic
    const offset = (page - 1) * limit;

    const offerProducts = await models.OfferProduct.findAndCountAll({
      where,
      include: [
        {
          model: models.Offer,
          as: "offer",
          attributes: ["id", "title"],
        },
        {
          model: models.Product,
          as: "product",
          attributes: ["id", "name", "image", "price", "offer_price"],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["id", "DESC"]],
      distinct: true,
    });

    return res.json({
      status: true,
      message: "Offer products fetched successfully",
      data: offerProducts.rows,
      total: offerProducts.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(offerProducts.count / limit),
    });
  } catch (error) {
    console.error("Get Offer Product List Error:", error);
    return res.json({
      status: false,
      message: error.message,
    });
  }
};

export const deleteOfferProduct = async (req, res) => {
  try {
    const { id } = req.body;

    const offerProduct = await models.OfferProduct.findOne({ where: { id } });
    if (!offerProduct) {
      return res.json({ status: false, message: "Offer product not found" });
    }

    await offerProduct.destroy(); // Soft delete

    return res.json({
      status: true,
      message: "Product removed from offer successfully",
    });
  } catch (error) {
    return res.json({ status: false, message: error.message });
  }
};

