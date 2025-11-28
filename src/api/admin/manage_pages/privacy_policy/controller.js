import models from "../../../../models/index.js";

export const addOrEditPrivacyPolicyPage = async (req, res) => {
  try {
    const { id, language = "en", title, description } = req.body;

    if (id) {
      const existingPage = await models.PrivacyPolicyPage.findOne({ where: { id } });
      if (!existingPage) {
        return res.status(404).json({
          status: false,
          message: "Privacy Policy page not found",
        });
      }

      const updateData = {};
      if (language !== undefined) updateData.language = language;
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;

      await existingPage.update(updateData);
      await existingPage.reload();

      return res.json({
        status: true,
        message: "Privacy Policy page updated successfully",
        data: existingPage,
      });
    }

    // CREATE
    const existing = await models.PrivacyPolicyPage.findOne({
      where: { language: language || "en" },
    });

    if (existing) {
      return res.status(400).json({
        status: false,
        message: "Privacy Policy page for this language already exists",
      });
    }

    const newPage = await models.PrivacyPolicyPage.create({
      language: language || "en",
      title,
      description,
    });

    return res.json({
      status: true,
      message: "Privacy Policy page created successfully",
      data: newPage,
    });
  } catch (error) {
    console.error("Add or Edit Privacy Policy Page error:", error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

export const getPrivacyPolicyPage = async (req, res) => {
  try {
    const { language = "en", id } = req.query;
    const where = id ? { id } : { language };

    const page = await models.PrivacyPolicyPage.findOne({ where });
    if (!page) {
      return res.status(404).json({
        status: false,
        message: "Privacy Policy page not found",
      });
    }

    return res.json({
      status: true,
      message: "Privacy Policy page fetched successfully",
      data: page,
    });
  } catch (error) {
    console.error("Get Privacy Policy Page error:", error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

export const getPrivacyPolicyPageList = async (req, res) => {
  try {
    const { language, page, limit } = req.query;
    const where = {};
    if (language) where.language = language;

    const order = [["language", "ASC"]];

    if (page && limit) {
      const pageNumber = parseInt(page) || 1;
      const limitNumber = parseInt(limit) || 10;
      const offset = (pageNumber - 1) * limitNumber;

      const result = await models.PrivacyPolicyPage.findAndCountAll({
        where,
        limit: limitNumber,
        offset,
        order,
      });

      return res.json({
        status: true,
        message: "Privacy Policy page list fetched successfully",
        data: result.rows,
        total: result.count,
        currentPage: pageNumber,
        totalPages: Math.ceil(result.count / limitNumber),
      });
    }

    const pages = await models.PrivacyPolicyPage.findAll({ where, order });
    return res.json({
      status: true,
      message: "Privacy Policy page list fetched successfully",
      data: pages,
      total: pages.length,
    });
  } catch (error) {
    console.error("Get Privacy Policy Page List error:", error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

export const deletePrivacyPolicyPage = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({
        status: false,
        message: "Page ID is required",
      });
    }

    const page = await models.PrivacyPolicyPage.findByPk(id);
    if (!page) {
      return res.status(404).json({
        status: false,
        message: "Privacy Policy page not found",
      });
    }

    await page.destroy();
    return res.json({
      status: true,
      message: "Privacy Policy page deleted successfully",
    });
  } catch (error) {
    console.error("Delete Privacy Policy Page error:", error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

