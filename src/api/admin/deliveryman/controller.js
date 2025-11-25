import models from "../../../models/index.js";
const { Op } = models.Sequelize;
import { deleteFile } from "../../../utils/fileUtils.js";
import bcrypt from "bcryptjs";

export const addOrEditDeliveryman = async (req, res) => {
  try {
    const id = req.body.id;
    const payload = {
      first_name: req.body.first_name,
      email: req.body.email,
      password: req.body.password,
      phone_number: req.body.phone_number,
    };

    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined || payload[key] === "") {
        delete payload[key];
      }
    });

    if (id) {
      const existing = await models.Deliveryman.findByPk(id);
      if (!existing) {
        return res.json({ status: false, message: "Deliveryman not found" });
      }

      // Handle image update
      if (req.file?.path) {
        // New image uploaded - delete old one
        if (existing.image) {
          await deleteFile(existing.image);
        }
        payload.image = req.file.path;
      }
      // If no new image, preserve existing image (don't include image in payload)

      // Hash password if provided (for update)
      if (payload.password) {
        payload.password = await bcrypt.hash(payload.password, 10);
      } else {
        delete payload.password;
      }

      await existing.update(payload);
      await existing.reload();
      const safeExisting = existing.toJSON();
      delete safeExisting.password;
      return res.json({
        status: true,
        message: "Deliveryman updated successfully",
        data: safeExisting,
      });
    }

    // Create new deliveryman
    if (req.file?.path) {
      payload.image = req.file.path;
    }

    // Hash password if provided (for new deliveryman)
    if (payload.password) {
      payload.password = await bcrypt.hash(payload.password, 10);
    }

    const created = await models.Deliveryman.create(payload);
    const safeCreated = created.toJSON();
    delete safeCreated.password;

    return res.json({
      status: true,
      message: "Deliveryman created successfully",
      data: safeCreated,
    });
  } catch (error) {
    console.error("Deliveryman add/edit error:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const getDeliverymanList = async (req, res) => {
  try {
    const {
      page,
      limit,
      search = "",
    } = req.query;

    const where = {};

    if (search) {
      const like = { [Op.like]: `%${search}%` };
      where[Op.or] = [{ first_name: like }, { email: like }, { phone_number: like }];
    }

    if (!page || !limit) {
      const list = await models.Deliveryman.findAll({
        where,
        order: [["id", "DESC"]],
        attributes: { exclude: ["password"] },
      });

      return res.json({
        status: true,
        message: "Deliveryman list fetched",
        data: list,
        total: list.length,
        currentPage: null,
        totalPages: null,
      });
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    const result = await models.Deliveryman.findAndCountAll({
      where,
      limit: limitNum,
      offset,
      order: [["id", "DESC"]],
      attributes: { exclude: ["password"] },
    });

    return res.json({
      status: true,
      message: "Deliveryman list fetched",
      data: result.rows,
      total: result.count,
      currentPage: pageNum,
      totalPages: Math.ceil(result.count / limitNum),
    });
  } catch (error) {
    console.error("Deliveryman list error:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const deleteDeliveryman = async (req, res) => {
  try {
    const { id } = req.body;

    const deliveryman = await models.Deliveryman.findByPk(id);
    if (!deliveryman) {
      return res.json({
        status: false,
        message: "Deliveryman not found",
      });
    }

    await deliveryman.destroy();

    return res.json({
      status: true,
      message: "Deliveryman deleted successfully",
    });
  } catch (error) {
    console.error("Deliveryman delete error:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

