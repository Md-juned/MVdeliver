import models from "../../../models/index.js";
import { generateToken } from "./service.js";
import bcrypt from "bcryptjs";
import { Op } from "sequelize";

export const register = async (req, res) => {
  try {
    const { name, email, password, fcm_token, device_id, device } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        status: false,
        message: "Name, email and password are required.",
      });
    }

    const existing = await models.User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({
        status: false,
        message: "Email already registered.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await models.User.create({
      name,
      email,
      password: hashedPassword,
    });

    if (device_id || fcm_token) {
      const existingDevice = await models.DeviceToken.findOne({
        where: { user_id: user.id },
      });

      const payload = {
        user_id: user.id,
        device_type: device || null,
        device_token: device_id || null,
        fcm_token: fcm_token || null,
      };

      if (existingDevice) {
        await existingDevice.update(payload);
      } else {
        await models.DeviceToken.create(payload);
      }
    }

    const token = generateToken(user);
    const userData = user.get({ plain: true });
    delete userData.password;

    return res.status(201).json({
      status: true,
      message: "Registered successfully.",
      data: {
        token,
        ...userData,
      },
    });
  } catch (error) {
    console.error("Register API Error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, device_id, device, fcm_token } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: false,
        message: "Email and password are required.",
      });
    }

    const user = await models.User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        status: false,
        message: "Invalid email or password.",
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({
        status: false,
        message: "Invalid email or password.",
      });
    }

    if (device_id || fcm_token) {
      const existingDevice = await models.DeviceToken.findOne({
        where: { user_id: user.id },
      });

      const payload = {
        user_id: user.id,
        device_type: device || null,
        device_token: device_id || null,
        fcm_token: fcm_token || null,
      };

      if (existingDevice) {
        await existingDevice.update(payload);
      } else {
        await models.DeviceToken.create(payload);
      }
    }

    const token = generateToken(user);
    const userData = user.get({ plain: true });
    delete userData.password;

    return res.json({
      status: true,
      message: "Login successful",
      data: {
        token,
        ...userData,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const {
      google_id,
      email,
      name,
      image,
      fcm_token,
      device_id,
      device,
    } = req.body;

    if (!google_id || !email) {
      return res.status(400).json({
        status: false,
        message: "Google ID and email are required.",
      });
    }

    // Check if user exists by social_id or email
    let user = await models.User.findOne({
      where: {
        [Op.or]: [
          { social_id: google_id, social_type: "google" },
          { email },
        ],
      },
    });

    if (user) {
      // Update social login info if not set
      if (!user.social_id || user.social_type !== "google") {
        await user.update({
          social_id: google_id,
          social_type: "google",
          image: image || user.image,
          name: name || user.name,
        });
      } else {
        // Update user info
        await user.update({
          name: name || user.name,
          image: image || user.image,
        });
      }
    } else {
      // Create new user
      user = await models.User.create({
        name: name || email.split("@")[0],
        email,
        password: "", // No password for social login
        social_id: google_id,
        social_type: "google",
        image: image || null,
      });
    }

    // Handle device tokens
    if (device_id || fcm_token) {
      const existingDevice = await models.DeviceToken.findOne({
        where: { user_id: user.id },
      });

      const payload = {
        user_id: user.id,
        device_type: device || null,
        device_token: device_id || null,
        fcm_token: fcm_token || null,
      };

      if (existingDevice) {
        await existingDevice.update(payload);
      } else {
        await models.DeviceToken.create(payload);
      }
    }

    const token = generateToken(user);
    const userData = user.get({ plain: true });
    delete userData.password;

    return res.json({
      status: true,
      message: "Google login successful",
      data: {
        token,
        ...userData,
      },
    });
  } catch (error) {
    console.error("Google Login Error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const facebookLogin = async (req, res) => {
  try {
    const {
      facebook_id,
      email,
      name,
      image,
      fcm_token,
      device_id,
      device,
    } = req.body;

    if (!facebook_id) {
      return res.status(400).json({
        status: false,
        message: "Facebook ID is required.",
      });
    }

    // Check if user exists by social_id or email
    let user = await models.User.findOne({
      where: {
        [Op.or]: [
          { social_id: facebook_id, social_type: "facebook" },
          email ? { email } : { id: -1 }, // Only check email if provided
        ],
      },
    });

    if (user) {
      // Update social login info if not set
      if (!user.social_id || user.social_type !== "facebook") {
        await user.update({
          social_id: facebook_id,
          social_type: "facebook",
          image: image || user.image,
          name: name || user.name,
          email: email || user.email,
        });
      } else {
        // Update user info
        await user.update({
          name: name || user.name,
          image: image || user.image,
          email: email || user.email,
        });
      }
    } else {
      // Create new user
      const userName = name || (email ? email.split("@")[0] : `User_${facebook_id.slice(0, 8)}`);
      user = await models.User.create({
        name: userName,
        email: email || `${facebook_id}@facebook.com`,
        password: "", // No password for social login
        social_id: facebook_id,
        social_type: "facebook",
        image: image || null,
      });
    }

    // Handle device tokens
    if (device_id || fcm_token) {
      const existingDevice = await models.DeviceToken.findOne({
        where: { user_id: user.id },
      });

      const payload = {
        user_id: user.id,
        device_type: device || null,
        device_token: device_id || null,
        fcm_token: fcm_token || null,
      };

      if (existingDevice) {
        await existingDevice.update(payload);
      } else {
        await models.DeviceToken.create(payload);
      }
    }

    const token = generateToken(user);
    const userData = user.get({ plain: true });
    delete userData.password;

    return res.json({
      status: true,
      message: "Facebook login successful",
      data: {
        token,
        ...userData,
      },
    });
  } catch (error) {
    console.error("Facebook Login Error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { current_password, new_password } = req.body;

    const user = await models.User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found." });
    }

    if (!user.password) {
      return res.status(400).json({
        status: false,
        message: "Password cannot be changed for social login accounts.",
      });
    }

    const match = await bcrypt.compare(current_password, user.password);
    if (!match) {
      return res
        .status(400)
        .json({ status: false, message: "Current password is incorrect." });
    }

    const isSamePassword = await bcrypt.compare(new_password, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        status: false,
        message: "New password must be different from current password.",
      });
    }

    const hashed = await bcrypt.hash(new_password, 10);
    await user.update({ password: hashed });

    return res.json({
      status: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    console.error("changePassword error:", error);
    return res
      .status(500)
      .json({ status: false, message: "Internal server error", error: error.message });
  }
};
