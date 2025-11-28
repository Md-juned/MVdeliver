import models from "../../../../models/index.js";
import { deleteFile } from "../../../../utils/fileUtils.js";

export const addOrEditLoginPage = async (req, res) => {
  try {
    const {
      id,
      language = "en",
      title_one,
      description_one,
      title_two,
      description_two,
      title_three,
      description_three,
    } = req.body;

    // Handle multiple image uploads
    const imageOne = req.files?.image_one?.[0]?.path || req.file?.path || null;
    const imageTwo = req.files?.image_two?.[0]?.path || null;
    const imageThree = req.files?.image_three?.[0]?.path || null;

    if (id) {
      const existingPage = await models.LoginPage.findOne({ where: { id } });
      if (!existingPage) {
        return res.status(404).json({
          status: false,
          message: "Login page not found",
        });
      }

      // Handle image deletions if new images are uploaded
      if (imageOne && existingPage.image_one) {
        await deleteFile(existingPage.image_one);
      }
      if (imageTwo && existingPage.image_two) {
        await deleteFile(existingPage.image_two);
      }
      if (imageThree && existingPage.image_three) {
        await deleteFile(existingPage.image_three);
      }

      const updateData = {};
      if (language !== undefined) updateData.language = language;
      if (title_one !== undefined) updateData.title_one = title_one;
      if (description_one !== undefined) updateData.description_one = description_one;
      if (title_two !== undefined) updateData.title_two = title_two;
      if (description_two !== undefined) updateData.description_two = description_two;
      if (title_three !== undefined) updateData.title_three = title_three;
      if (description_three !== undefined) updateData.description_three = description_three;
      if (imageOne) updateData.image_one = imageOne;
      else updateData.image_one = existingPage.image_one;
      if (imageTwo !== undefined) updateData.image_two = imageTwo || null;
      if (imageThree !== undefined) updateData.image_three = imageThree || null;

      await existingPage.update(updateData);
      await existingPage.reload();

      return res.json({
        status: true,
        message: "Login page updated successfully",
        data: existingPage,
      });
    }

    // CREATE
    const existing = await models.LoginPage.findOne({
      where: { language: language || "en" },
    });

    if (existing) {
      return res.status(400).json({
        status: false,
        message: "Login page for this language already exists",
      });
    }

    const newPage = await models.LoginPage.create({
      language: language || "en",
      image_one: imageOne,
      title_one,
      description_one,
      image_two: imageTwo,
      title_two,
      description_two,
      image_three: imageThree,
      title_three,
      description_three,
    });

    return res.json({
      status: true,
      message: "Login page created successfully",
      data: newPage,
    });
  } catch (error) {
    console.error("Add or Edit Login Page error:", error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

export const getLoginPage = async (req, res) => {
  try {
    const { language = "en", id } = req.query;
    const where = id ? { id } : { language };

    const page = await models.LoginPage.findOne({ where });
    if (!page) {
      return res.status(404).json({
        status: false,
        message: "Login page not found",
      });
    }

    return res.json({
      status: true,
      message: "Login page fetched successfully",
      data: page,
    });
  } catch (error) {
    console.error("Get Login Page error:", error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

export const getLoginPageList = async (req, res) => {
  try {
    const { language, page, limit } = req.query;
    const where = {};
    if (language) where.language = language;

    const order = [["language", "ASC"]];

    if (page && limit) {
      const pageNumber = parseInt(page) || 1;
      const limitNumber = parseInt(limit) || 10;
      const offset = (pageNumber - 1) * limitNumber;

      const result = await models.LoginPage.findAndCountAll({
        where,
        limit: limitNumber,
        offset,
        order,
      });

      return res.json({
        status: true,
        message: "Login page list fetched successfully",
        data: result.rows,
        total: result.count,
        currentPage: pageNumber,
        totalPages: Math.ceil(result.count / limitNumber),
      });
    }

    const pages = await models.LoginPage.findAll({ where, order });
    return res.json({
      status: true,
      message: "Login page list fetched successfully",
      data: pages,
      total: pages.length,
    });
  } catch (error) {
    console.error("Get Login Page List error:", error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

export const deleteLoginPage = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({
        status: false,
        message: "Page ID is required",
      });
    }

    const page = await models.LoginPage.findByPk(id);
    if (!page) {
      return res.status(404).json({
        status: false,
        message: "Login page not found",
      });
    }

    // Delete all associated images
    if (page.image_one) await deleteFile(page.image_one);
    if (page.image_two) await deleteFile(page.image_two);
    if (page.image_three) await deleteFile(page.image_three);

    await page.destroy();
    return res.json({
      status: true,
      message: "Login page deleted successfully",
    });
  } catch (error) {
    console.error("Delete Login Page error:", error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

