import models from "../../../../models/index.js";

export const addOrEditContactUsPage = async (req, res) => {
  try {
    const { id, language = "en", title, email, phone } = req.body;

    if (id) {
      const existingPage = await models.ContactUsPage.findOne({ where: { id } });
      if (!existingPage) {
        return res.status(404).json({
          status: false,
          message: "Contact Us page not found",
        });
      }

      const updateData = {};
      if (language !== undefined) updateData.language = language;
      if (title !== undefined) updateData.title = title;
      if (email !== undefined) updateData.email = email;
      if (phone !== undefined) updateData.phone = phone;

      await existingPage.update(updateData);
      await existingPage.reload();

      return res.json({
        status: true,
        message: "Contact Us page updated successfully",
        data: existingPage,
      });
    }

    // CREATE
    const existing = await models.ContactUsPage.findOne({
      where: { language: language || "en" },
    });

    if (existing) {
      return res.status(400).json({
        status: false,
        message: "Contact Us page for this language already exists",
      });
    }

    const newPage = await models.ContactUsPage.create({
      language: language || "en",
      title,
      email,
      phone,
    });

    return res.json({
      status: true,
      message: "Contact Us page created successfully",
      data: newPage,
    });
  } catch (error) {
    console.error("Add or Edit Contact Us Page error:", error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

export const getContactUsPage = async (req, res) => {
  try {
    const { language = "en", id } = req.query;
    const where = id ? { id } : { language };

    const page = await models.ContactUsPage.findOne({ where });
    if (!page) {
      return res.status(404).json({
        status: false,
        message: "Contact Us page not found",
      });
    }

    return res.json({
      status: true,
      message: "Contact Us page fetched successfully",
      data: page,
    });
  } catch (error) {
    console.error("Get Contact Us Page error:", error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

export const getContactUsPageList = async (req, res) => {
  try {
    const { language, page, limit } = req.query;
    const where = {};
    if (language) where.language = language;

    const order = [["language", "ASC"]];

    if (page && limit) {
      const pageNumber = parseInt(page) || 1;
      const limitNumber = parseInt(limit) || 10;
      const offset = (pageNumber - 1) * limitNumber;

      const result = await models.ContactUsPage.findAndCountAll({
        where,
        limit: limitNumber,
        offset,
        order,
      });

      return res.json({
        status: true,
        message: "Contact Us page list fetched successfully",
        data: result.rows,
        total: result.count,
        currentPage: pageNumber,
        totalPages: Math.ceil(result.count / limitNumber),
      });
    }

    const pages = await models.ContactUsPage.findAll({ where, order });
    return res.json({
      status: true,
      message: "Contact Us page list fetched successfully",
      data: pages,
      total: pages.length,
    });
  } catch (error) {
    console.error("Get Contact Us Page List error:", error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

export const deleteContactUsPage = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({
        status: false,
        message: "Page ID is required",
      });
    }

    const page = await models.ContactUsPage.findByPk(id);
    if (!page) {
      return res.status(404).json({
        status: false,
        message: "Contact Us page not found",
      });
    }

    await page.destroy();
    return res.json({
      status: true,
      message: "Contact Us page deleted successfully",
    });
  } catch (error) {
    console.error("Delete Contact Us Page error:", error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

