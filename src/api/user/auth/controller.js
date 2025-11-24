import models from "../../../models/index.js";
import { generateToken } from "./service.js";
import bcrypt from "bcryptjs";

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
