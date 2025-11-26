import { Op } from "sequelize";
import models from "../../../models/index.js";

const sanitizeUser = (userInstance) => {
  const data = userInstance.get({ plain: true });
  delete data.password;
  return data;
};

export const getProfile = async (req, res) => {
  try {
    const user = await models.User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found." });
    }

    return res.json({
      status: true,
      message: "Profile fetched successfully",
      data: sanitizeUser(user),
    });
  } catch (error) {
    console.error("getProfile error:", error);
    return res
      .status(500)
      .json({ status: false, message: "Internal server error", error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await models.User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found." });
    }

    const {
      name,
      email,
      phone,
      country_code,
      address,
      latitude,
      longitude,
      dob,
    } = req.body;

    if (address && (latitude === undefined || longitude === undefined)) {
      return res.status(400).json({
        status: false,
        message: "Latitude and longitude are required when updating address.",
      });
    }

    const updates = {};

    if (name !== undefined) {
      updates.name = name;
    }

    if (email !== undefined && email !== user.email) {
      const existing = await models.User.findOne({
        where: { email, id: { [Op.ne]: userId } },
      });
      if (existing) {
        return res
          .status(409)
          .json({ status: false, message: "Email is already in use by another account." });
      }
      updates.email = email;
    }

    if (phone !== undefined) {
      updates.phone = phone;
    }

    if (country_code !== undefined) {
      updates.country_code = country_code;
    }

    if (address !== undefined) {
      updates.address = address;
    }

    if (latitude !== undefined) {
      updates.lat =
        latitude === null || latitude === "" ? null : parseFloat(latitude);
    }

    if (longitude !== undefined) {
      updates.lng =
        longitude === null || longitude === "" ? null : parseFloat(longitude);
    }

    if (dob !== undefined) {
      updates.dob = dob;
    }

    if (req.file?.path) {
      updates.image = req.file.path;
    }

    if (!Object.keys(updates).length) {
      return res.json({
        status: true,
        message: "Nothing to update",
        data: sanitizeUser(user),
      });
    }

    await user.update(updates);
    const refreshedUser = await models.User.findByPk(userId);

    return res.json({
      status: true,
      message: "Profile updated successfully",
      data: sanitizeUser(refreshedUser),
    });
  } catch (error) {
    console.error("updateProfile error:", error);
    return res
      .status(500)
      .json({ status: false, message: "Internal server error", error: error.message });
  }
};

