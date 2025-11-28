import models from "../../../models/index.js";
import { deleteFile } from "../../../utils/fileUtils.js";

const STRIPE_GATEWAY = "stripe";

const normalizeStatus = (value, fallback = "inactive") => {
  if (value === undefined || value === null || value === "") return fallback;

  if (typeof value === "boolean") {
    return value ? "active" : "inactive";
  }

  const lowered = String(value).toLowerCase();
  if (["active", "inactive"].includes(lowered)) {
    return lowered;
  }

  if (["true", "1", "yes", "enable", "enabled", "on"].includes(lowered)) {
    return "active";
  }

  if (["false", "0", "no", "disable", "disabled", "off"].includes(lowered)) {
    return "inactive";
  }

  return fallback;
};

const sanitize = (value, fallback = "") => {
  if (value === undefined || value === null) return fallback;
  const trimmed = String(value).trim();
  return trimmed === "" ? fallback : trimmed;
};

const findOrCreateStripeGateway = async () => {
  let gateway = await models.PaymentGateway.findOne({ where: { gateway: STRIPE_GATEWAY } });

  if (!gateway) {
    gateway = await models.PaymentGateway.create({
      gateway: STRIPE_GATEWAY,
      status: "inactive",
      currency: "USD",
      public_key: "",
      secret_key: "",
    });
  }

  return gateway;
};

export const saveStripeGateway = async (req, res) => {
  try {
    const { currency, stripe_key, stripe_secret, status } = req.body;
    const stripeGateway = await findOrCreateStripeGateway();

    let finalImage = stripeGateway.image;
    if (req.file?.path) {
      if (stripeGateway.image) {
        await deleteFile(stripeGateway.image);
      }
      finalImage = req.file.path;
    }

    await stripeGateway.update({
      currency: sanitize(currency, stripeGateway.currency),
      public_key: sanitize(stripe_key, stripeGateway.public_key),
      secret_key: sanitize(stripe_secret, stripeGateway.secret_key),
      status: normalizeStatus(status, stripeGateway.status),
      image: finalImage,
    });

    await stripeGateway.reload();

    return res.json({
      status: true,
      message: "Stripe configuration saved successfully",
      data: stripeGateway,
    });
  } catch (error) {
    console.error("Save stripe gateway error:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const getStripeGateway = async (req, res) => {
  try {
    const stripeGateway = await findOrCreateStripeGateway();

    return res.json({
      status: true,
      message: "Stripe configuration fetched successfully",
      data: stripeGateway,
    });
  } catch (error) {
    console.error("Get stripe gateway error:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};


