import models from "../../../models/index.js";

const PRELOADER_STATES = ["enable", "disable"];
const COMMISSION_TYPES = ["commission", "subscription"];

const normalizeEnum = (value, allowed, fallback) => {
  if (!value) return fallback;
  const lowered = String(value).toLowerCase();
  return allowed.includes(lowered) ? lowered : fallback;
};

const toDecimal = (value, fallback = 0) => {
  if (value === undefined || value === null || value === "") return fallback;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const sanitizeString = (value, fallback = "") => {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
};

const buildSettingPayload = (body) => ({
  app_name: sanitizeString(body.app_name, "Foodigo"),
  preloader: normalizeEnum(body.preloader, PRELOADER_STATES, "disable"),
  commission_type: sanitizeString(body.commission_type, "commission").toLowerCase(),
  seller_commission_per_delivery: toDecimal(body.seller_commission_per_delivery, 2),
  delivery_commission_per_delivery: toDecimal(body.delivery_commission_per_delivery, 2.5),
  contact_message_receiver_email: sanitizeString(body.contact_message_receiver_email, "admin@gmail.com").toLowerCase(),
  timezone: sanitizeString(body.timezone, "Asia/Dhaka"),
  per_kilometer_delivery_charge: toDecimal(body.per_kilometer_delivery_charge, 3),
});

const findCurrentSetting = async () => {
  return models.Setting.findOne({
    order: [["id", "ASC"]],
  });
};

export const saveGeneralSetting = async (req, res) => {
  try {
    const payload = buildSettingPayload(req.body);

    if (!COMMISSION_TYPES.includes(payload.commission_type)) {
      payload.commission_type = "commission";
    }

    let setting = await findCurrentSetting();

    if (setting) {
      await setting.update(payload);
      await setting.reload();
    } else {
      setting = await models.Setting.create(payload);
    }

    return res.json({
      status: true,
      message: "General setting saved successfully",
      data: setting,
    });
  } catch (error) {
    console.error("Save general setting error:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const getGeneralSetting = async (req, res) => {
  try {
    let setting = await findCurrentSetting();

    if (!setting) {
      setting = await models.Setting.create({
        app_name: "Foodigo",
        preloader: "disable",
        commission_type: "commission",
        seller_commission_per_delivery: 2,
        delivery_commission_per_delivery: 2.5,
        contact_message_receiver_email: "admin@gmail.com",
        timezone: "Asia/Dhaka",
        per_kilometer_delivery_charge: 3,
      });
    }

    return res.json({
      status: true,
      message: "General setting fetched successfully",
      data: setting,
    });
  } catch (error) {
    console.error("Get general setting error:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};


