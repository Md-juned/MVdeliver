import { messages } from "../../common/constant/messageConstants.js"
import models from "../../models/index.js";
import bcrypt from "bcryptjs";



export const sendOtp = async (req, res) => {
  try {
    const { country_code, mobile_number, language } = req.body;

    const [auth] = await models.User.findOrCreate({
      where: { country_code, mobile_number },
      defaults: { country_code, mobile_number },
    });

    const otp = generateOTP();

    auth.otp = otp;
    await auth.save();

    // TODO: Implement the actual OTP sending function here

    return res.send({ status: true, message: messages(language, "otp_sent") });
  } catch (error) {
    return res.send({ status: false, message: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const {
      country_code,
      mobile_number,
      otp,
      fcm_token,
      device_token,
      device_type,
      language,
    } = req.body;

    const user = await models.User.findOne({
      where: { country_code, mobile_number },
      attributes: [
        "id",
        "country_code",
        "mobile_number",
        "role",
        "otp",
        "token",
      ],
    });

    if (!user) {
      return res.send({
        status: false,
        message: messages(language, "user_not_found"),
      });
    }

    if (user.otp !== otp) {
      return res.send({
        status: false,
        message: messages(language, "invalid_otp"),
      });
    }

    // generate auth token
    const generatedAuthToken = generateAuthToken();

    //store device token for notification
    if (device_type || device_token || fcm_token) {
      //insert device tokens
      await models.DeviceToken.upsert({
        user_id: user.id,
        auth_token: generatedAuthToken,
        device_type: device_type,
        device_token: device_token,
        fcm_token: fcm_token,
      });
    }

    // OTP verification successful, clear the OTP field
    user.otp = null;
    user.token = generatedAuthToken;
    await user.save();

    //generate jwt data
    const jwtToken = generateToken(user);

    return res.send({
      status: true,
      message: messages(language, "otp_verified"),
      data: { jwt_token: jwtToken },
    });
  } catch (error) {
    return res.send({ status: false, message: error.message });
  }
};

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

// -------------------------------juned--start tawazun--------------------------------

export const register = async (req, res) => {
  try {
    const { name, email, password, phone, country_code, language } = req.body;
    const lang = language || "en";

    // check if user already exists
    const existingUser = await models.User.findOne({ where: { email } });
    if (existingUser) {
      return res.send({
        status: false,
        message: "email_already_exists",
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create new user
    const newUser = await models.User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      country_code,
    });

    // generate auth token
    const generatedAuthToken = generateAuthToken();
    newUser.token = generatedAuthToken;
    await newUser.save();

    // generate JWT token
    const jwtToken = generateToken(newUser);

    return res.send({
      status: true,
      message: "registration_success",
      data: { jwt_token: jwtToken },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.send({ status: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, language } = req.body;
    const lang = language || "en";

    const user = await models.User.findOne({
      where: { email },
      attributes: ["id", "email", "password"],
    });

    if (!user) {
      return res.send({
        status: false,
        message:"user_not_found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.send({
        status: false,
        message: "invalid_credentials",
      });
    }

    const generatedAuthToken = generateAuthToken();
    user.token = generatedAuthToken;
    await user.save();

    const jwtToken = generateToken(user);

    return res.send({
      status: true,
      message: "login_success",
      data: { jwt_token: jwtToken },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.send({ status: false, message: error.message });
  }
};


