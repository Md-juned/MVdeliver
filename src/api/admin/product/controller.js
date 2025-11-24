import models from "../../../models/index.js";


// ---- Food Category ----

export const addOrEditFoodCategory = async (req, res) => {
  try {
    const { id, name, status } = req.body;

    const image = req.file?.path || null;

    // ======= EDIT =========
    if (id) {
      const existing = await models.FoodCategory.findOne({ where: { id } });

     console.log("===================================",req.body);

      if (!existing) {
        return res.json({ status: false, message: "Food category not found" });
      }

      await existing.update({
        name: name ?? existing.name,
        image: image ? image : existing.image,
        status: status ?? existing.status,
      });

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
    const {
      id,
      name,
      category_id,
      restaurant_id,
      price,
      offer_price,
      short_description,
      status,
    } = req.body;

     

    // Helper to safely parse JSON strings or use arrays directly
    const parseField = (field) => {
      if (!field) return [];
      if (Array.isArray(field)) return field;
      try {
        return JSON.parse(field);
      } catch {
        return []; // fallback if invalid JSON
      }
    };

    const sizesArray = parseField(req.body.sizes);
    const specificationsArray = parseField(req.body.specifications);
    const addonIdsArray = parseField(req.body.addon_ids);

    const image = req.file?.path || null;

    let product;

    if (id) {
      // Update existing product
      product = await models.Product.findOne({ where: { id } });
      if (!product) return res.json({ status: false, message: "Product not found" });

      await product.update({
        name,
        category_id,
        restaurant_id,
        price,
        offer_price,
        short_description,
        status,
        image: image ?? product.image,
      });

      // Remove old relations
      await models.ProductSize.destroy({ where: { product_id: id },force: true });
      await models.ProductSpecification.destroy({ where: { product_id: id },force: true });
      await models.ProductAddon.destroy({ where: { product_id: id },force: true });

    } else {
      // Create new product
      product = await models.Product.create({
        name,
        category_id,
        restaurant_id,
        price,
        offer_price,
        short_description,
        status: status || "active",
        image,
      });
    }

    // Insert Sizes
    if (sizesArray.length) {
      const sizeRows = sizesArray.map(size => ({
        product_id: product.id,
        size_name: size.size_name || "Unknown",
        price: size.price || 0,
      }));
      await models.ProductSize.bulkCreate(sizeRows);
    }

       // Insert Addons
    if (addonIdsArray.length) {
      const addonRows = addonIdsArray.map(addon_id => ({
        product_id: product.id,
        addon_id,
      }));
      await models.ProductAddon.bulkCreate(addonRows);
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
    console.log(error)
    return res.json({ status: false, message: error.message });
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

      await addon.update({
        name,
        restaurant_id,
        price,
        status: status || addon.status,
        // image: image ?? addon.image,
      });
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


