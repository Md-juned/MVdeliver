import models from "../../../models/index.js";
import bcrypt from "bcryptjs";
import {generateToken} from "./service.js"


export const logout = async (req, res) => {
  try {
    const { device_token } = req.body;
    const userId = req.user.id;

    const device = await models.DeviceToken.findOne({
      where: { user_id: userId, device_token: device_token },
    });

    if (device) {
      // Delete the device entry
      await device.destroy();
    }

    return res.send({ status: true, message: messages.LOGOUT_SUCCESS });
  } catch (error) {
    res.send({ status: false, message: error.message });
  }
};

// -------------------------------juned--start tawazun-------------------------------

export const createAdmin = async (req, res) => {
  try {
    const {
      image,
      name,
      email,
      password,
      role,
    } = req.body;


    // 1. Check if email already exists
    const existing = await models.Admin.findOne({ where: { email } });
    if (existing) {
      return res.json({ status: false, message: "Email already exists" });
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // 3. Insert admin into DB (Sequelize)
    const newAdmin = await models.Admin.create({
      image: image || "assets/others/default-img.jpg",
      name,
      email,
      password: hashedPassword,
      role,
    });
    res.json({
      status: true,
      message: "Admin created successfully",
      data: newAdmin,
    });
  } catch (error) {
    res.json({ status: false, message: error.message });
  }
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Validate input
    if (!email || !password) {
      return res.send({
        status: false,
        message: "Email and password are required.",
      });
    }
    // Find user
    const user = await models.Admin.findOne({ where: { email }, });
    if (!user) {
      return res.send({
        status: false,
        message: "Invalid email or password.",
      });
    }
    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.send({
        status: false,
        message: "Invalid email or password.",
      });
    }
    // Generate JWT token
    const token = generateToken({
      id: user.id,
      role: "admin"
    });
    // Convert Sequelize instance to plain object and remove password
    const userData = user.get({ plain: true });
    delete userData.password;
    return res.send({
      status: true,
      message: "Login successful.",
      data: {
        ...userData,
        token,
      }
    });
  } catch (error) {
    return res.send({
      status: false,
      message: error.message,
    });
  }
};


