import models from "../../../../models/index.js";
import { deleteFile } from "../../../../utils/fileUtils.js";

const parseJSON = (value, fallback = null) => {
  if (!value) return fallback;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch (e) {
    return fallback;
  }
};

const stringifyJSON = (value) => {
  if (!value) return null;
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch (e) {
    return null;
  }
};

export const addOrEditAboutUsPage = async (req, res) => {
  try {
    const { id, language = "en", title, description, experience_year, additional_data } = req.body;
    const aboutImage = req.file?.path || null;

    // UPDATE
    if (id) {
      const existingPage = await models.AboutUsPage.findOne({ where: { id } });
      if (!existingPage) {
        return res.status(404).json({
          status: false,
          message: "About Us page not found",
        });
      }

      // Handle image deletion if new image is uploaded
      if (aboutImage && existingPage.about_image) {
        await deleteFile(existingPage.about_image);
      }

      const updateData = {};
      if (language !== undefined) updateData.language = language;
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (experience_year !== undefined) {
        updateData.experience_year = experience_year ? parseInt(experience_year) : null;
      }
      if (additional_data !== undefined) {
        updateData.additional_data = stringifyJSON(additional_data);
      }
      if (aboutImage) updateData.about_image = aboutImage;
      else updateData.about_image = existingPage.about_image;

      await existingPage.update(updateData);
      await existingPage.reload();

      // Parse JSON for response
      const pageData = existingPage.toJSON();
      if (pageData.additional_data) {
        pageData.additional_data = parseJSON(pageData.additional_data);
      }

      return res.json({
        status: true,
        message: "About Us page updated successfully",
        data: pageData,
      });
    }

    // CREATE - Check if page with same language already exists
    const existing = await models.AboutUsPage.findOne({
      where: { language: language || "en" },
    });

    if (existing) {
      return res.status(400).json({
        status: false,
        message: "About Us page for this language already exists",
      });
    }

    const newPage = await models.AboutUsPage.create({
      language: language || "en",
      about_image: aboutImage,
      title,
      description,
      experience_year: experience_year ? parseInt(experience_year) : null,
      additional_data: stringifyJSON(additional_data),
    });

    const pageData = newPage.toJSON();
    if (pageData.additional_data) {
      pageData.additional_data = parseJSON(pageData.additional_data);
    }

    return res.json({
      status: true,
      message: "About Us page created successfully",
      data: pageData,
    });
  } catch (error) {
    console.error("Add or Edit About Us Page error:", error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

export const getAboutUsPage = async (req, res) => {
  try {
    const { language = "en", id } = req.query;
    const where = id ? { id } : { language };

    const page = await models.AboutUsPage.findOne({ where });
    if (!page) {
      return res.status(404).json({
        status: false,
        message: "About Us page not found",
      });
    }

    const pageData = page.toJSON();
    if (pageData.additional_data) {
      pageData.additional_data = parseJSON(pageData.additional_data);
    }

    return res.json({
      status: true,
      message: "About Us page fetched successfully",
      data: pageData,
    });
  } catch (error) {
    console.error("Get About Us Page error:", error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

export const getAboutUsPageList = async (req, res) => {
  try {
    const { language, page, limit } = req.query;
    const where = {};
    if (language) where.language = language;

    const order = [["language", "ASC"]];

    if (page && limit) {
      const pageNumber = parseInt(page) || 1;
      const limitNumber = parseInt(limit) || 10;
      const offset = (pageNumber - 1) * limitNumber;

      const result = await models.AboutUsPage.findAndCountAll({
        where,
        limit: limitNumber,
        offset,
        order,
      });

      const items = result.rows.map((item) => {
        const itemData = item.toJSON();
        if (itemData.additional_data) {
          itemData.additional_data = parseJSON(itemData.additional_data);
        }
        return itemData;
      });

      return res.json({
        status: true,
        message: "About Us page list fetched successfully",
        data: items,
        total: result.count,
        currentPage: pageNumber,
        totalPages: Math.ceil(result.count / limitNumber),
      });
    }

    const pages = await models.AboutUsPage.findAll({ where, order });
    const items = pages.map((item) => {
      const itemData = item.toJSON();
      if (itemData.additional_data) {
        itemData.additional_data = parseJSON(itemData.additional_data);
      }
      return itemData;
    });

    return res.json({
      status: true,
      message: "About Us page list fetched successfully",
      data: items,
      total: items.length,
    });
  } catch (error) {
    console.error("Get About Us Page List error:", error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

export const deleteAboutUsPage = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({
        status: false,
        message: "Page ID is required",
      });
    }

    const page = await models.AboutUsPage.findByPk(id);
    if (!page) {
      return res.status(404).json({
        status: false,
        message: "About Us page not found",
      });
    }

    if (page.about_image) {
      await deleteFile(page.about_image);
    }

    await page.destroy();
    return res.json({
      status: true,
      message: "About Us page deleted successfully",
    });
  } catch (error) {
    console.error("Delete About Us Page error:", error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

