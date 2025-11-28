import models from "../../../models/index.js";
import { deleteFile } from "../../../utils/fileUtils.js";

const { Op } = models.Sequelize;

const normalizeStatus = (value, fallback) => {
  if (value === undefined || value === null || value === "") return fallback;

  if (typeof value === "boolean") {
    return value ? "active" : "inactive";
  }

  const lowered = String(value).toLowerCase();

  if (["active", "inactive"].includes(lowered)) {
    return lowered;
  }

  if (["true", "1", "yes", "enable", "enabled"].includes(lowered)) {
    return "active";
  }

  if (["false", "0", "no", "disable", "disabled"].includes(lowered)) {
    return "inactive";
  }

  return fallback;
};

const parseInteger = (value, fallback = undefined) => {
  if (value === undefined || value === null || value === "") return fallback;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

// ======================
// Offer Deal Banners
// ======================

export const addOrEditOfferDealBanner = async (req, res) => {
  try {
    const { id, url, status, display_order } = req.body;
    const imagePath = req.file?.path;

    if (id) {
      const banner = await models.OfferDealBanner.findOne({ where: { id } });
      if (!banner) {
        return res.json({ status: false, message: "Offer deal banner not found" });
      }

      let finalImage = banner.image;
      if (imagePath) {
        if (banner.image) {
          await deleteFile(banner.image);
        }
        finalImage = imagePath;
      }

      const payload = {
        image: finalImage,
      };

      if (url !== undefined) payload.url = url;
      if (status !== undefined) payload.status = normalizeStatus(status, banner.status);

      const parsedOrder = parseInteger(display_order);
      if (parsedOrder !== undefined) {
        payload.display_order = parsedOrder;
      }

      await banner.update(payload);

      return res.json({
        status: true,
        message: "Offer deal banner updated successfully",
        data: banner,
      });
    }

    if (!imagePath) {
      return res.status(400).json({
        status: false,
        message: "Banner image is required",
      });
    }

    const newBanner = await models.OfferDealBanner.create({
      image: imagePath,
      url,
      status: normalizeStatus(status, "active"),
      display_order: parseInteger(display_order, 0) ?? 0,
    });

    return res.json({
      status: true,
      message: "Offer deal banner created successfully",
      data: newBanner,
    });
  } catch (error) {
    console.error("Offer deal banner error:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const getOfferDealBannerList = async (req, res) => {
  try {
    const { page, limit, search = "", status } = req.query;

    const where = {};

    if (search) {
      where.url = { [Op.like]: `%${search}%` };
    }

    const normalizedStatus = normalizeStatus(status);
    if (normalizedStatus) {
      where.status = normalizedStatus;
    }

    const order = [
      ["display_order", "ASC"],
      ["id", "DESC"],
    ];

    if (!page || !limit) {
      const banners = await models.OfferDealBanner.findAll({ where, order });
      return res.json({
        status: true,
        message: "Offer deal banners fetched successfully",
        data: banners,
        total: banners.length,
        currentPage: null,
        totalPages: null,
      });
    }

    const offset = (page - 1) * limit;
    const banners = await models.OfferDealBanner.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order,
    });

    return res.json({
      status: true,
      message: "Offer deal banners fetched successfully",
      data: banners.rows,
      total: banners.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(banners.count / limit),
    });
  } catch (error) {
    console.error("Get offer deal banners error:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const getSingleOfferDealBanner = async (req, res) => {
  try {
    const { id } = req.query;

    const banner = await models.OfferDealBanner.findOne({ where: { id } });
    if (!banner) {
      return res.json({ status: false, message: "Offer deal banner not found" });
    }

    return res.json({
      status: true,
      message: "Offer deal banner fetched successfully",
      data: banner,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const deleteOfferDealBanner = async (req, res) => {
  try {
    const { id } = req.body;

    const banner = await models.OfferDealBanner.findOne({ where: { id } });
    if (!banner) {
      return res.json({ status: false, message: "Offer deal banner not found" });
    }

    if (banner.image) {
      await deleteFile(banner.image);
    }

    await banner.destroy();

    return res.json({
      status: true,
      message: "Offer deal banner deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// ======================
// Promotional Banners
// ======================

const resolveBannerIdentifier = async ({ id, sectionKey, transaction }) => {
  const where = {};

  if (id) where.id = id;
  else if (sectionKey) where.section_key = sectionKey;

  if (!Object.keys(where).length) return null;

  return models.PromotionalBanner.findOne({ where, transaction });
};

const parseJsonPayload = (value) => {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch (error) {
      const parsingError = new Error("Invalid banners payload. Expecting valid JSON.");
      parsingError.statusCode = 400;
      throw parsingError;
    }
  }
  return value;
};

const extractBannerPayloads = (body) => {
  if (!body || body.banners === undefined) {
    return [
      {
        id: body?.id,
        section_key: body?.section_key,
        key: body?.key,
        title: body?.title,
        url: body?.url,
        status: body?.status,
        display_order: body?.display_order,
      },
    ];
  }

  let payloads = parseJsonPayload(body.banners);

  if (!payloads || (Array.isArray(payloads) && !payloads.length)) {
    const emptyError = new Error("Banners payload cannot be empty.");
    emptyError.statusCode = 400;
    throw emptyError;
  }

  if (!Array.isArray(payloads)) {
    payloads = [payloads];
  }

  return payloads;
};

const buildFileDictionary = (files) => {
  if (!files) return {};
  const dictionary = {};
  (Array.isArray(files) ? files : [files]).forEach((file) => {
    if (file?.fieldname) {
      dictionary[file.fieldname] = file;
    }
  });
  return dictionary;
};

const normalizeField = (value) => {
  if (!value) return "";
  return String(value).replace(/[\[\]\s]/g, "").toLowerCase();
};

const locateImagePathForBanner = (bannerPayload, fileDictionary) => {
  if (!fileDictionary || !Object.keys(fileDictionary).length) return null;

  const candidates = [
    bannerPayload?.image_field,
    bannerPayload?.imageField,
    bannerPayload?.section_key,
    bannerPayload?.sectionKey,
    bannerPayload?.key,
    bannerPayload?.banner_key,
  ].filter(Boolean);

  const variations = [];
  const seen = new Set();

  candidates.forEach((candidate) => {
    const base = String(candidate).trim();
    [
      base,
      `${base}_image`,
      `${base}_file`,
      `${base}Image`,
      `image_${base}`,
      base.toLowerCase(),
      `${base.toLowerCase()}_image`,
    ].forEach((option) => {
      if (option && !seen.has(option)) {
        variations.push(option);
        seen.add(option);
      }
    });
  });

  // Generic fallback
  variations.push("image");

  const dictionaryEntries = Object.entries(fileDictionary);

  for (const candidate of variations) {
    if (!candidate) continue;
    if (fileDictionary[candidate]) {
      return fileDictionary[candidate].path;
    }

    const normalizedCandidate = normalizeField(candidate);
    const matchedEntry = dictionaryEntries.find(
      ([fieldName]) => normalizeField(fieldName) === normalizedCandidate
    );
    if (matchedEntry) {
      return matchedEntry[1].path;
    }
  }

  return null;
};

const resolveSectionKeyFromPayload = (payload, fallbackSectionKey) =>
  payload?.section_key ||
  payload?.sectionKey ||
  payload?.key ||
  payload?.banner_key ||
  fallbackSectionKey ||
  null;

const processSinglePromotionalBanner = async ({
  payload,
  sectionKeyFallback,
  fileDictionary,
  transaction,
  filesToDelete,
}) => {
  const bannerId = payload?.id;
  const sectionKey = resolveSectionKeyFromPayload(payload, sectionKeyFallback);

  if (!bannerId && !sectionKey) {
    const identificationError = new Error(
      "Each banner payload must include either id or section_key."
    );
    identificationError.statusCode = 400;
    throw identificationError;
  }

  let banner = await resolveBannerIdentifier({ id: bannerId, sectionKey, transaction });
  const imagePath = locateImagePathForBanner(payload, fileDictionary);

  if (!banner) {
    if (!sectionKey) {
      const sectionError = new Error("section_key is required when creating a new promotional banner.");
      sectionError.statusCode = 400;
      throw sectionError;
    }

    if (!payload?.title) {
      const titleError = new Error(
        `Title is required when creating promotional banner for section '${sectionKey}'.`
      );
      titleError.statusCode = 400;
      throw titleError;
    }

    if (!imagePath) {
      const imageError = new Error(
        `Image is required when creating promotional banner for section '${sectionKey}'.`
      );
      imageError.statusCode = 400;
      throw imageError;
    }

    const newBanner = await models.PromotionalBanner.create(
      {
        section_key: sectionKey,
        title: payload.title,
        image: imagePath,
        url: payload.url || "",
        status: normalizeStatus(payload.status, "inactive"),
        display_order: parseInteger(payload.display_order, 0) ?? 0,
      },
      { transaction }
    );

    return { action: "created", banner: newBanner };
  }

  let finalImage = banner.image;
  if (imagePath) {
    finalImage = imagePath;
    if (banner.image) {
      filesToDelete.push(banner.image);
    }
  }

  const updatePayload = {
    image: finalImage,
  };

  if (payload.title !== undefined) updatePayload.title = payload.title;
  if (sectionKey !== undefined && sectionKey !== null) updatePayload.section_key = sectionKey;
  if (payload.url !== undefined) updatePayload.url = payload.url;
  if (payload.status !== undefined) {
    updatePayload.status = normalizeStatus(payload.status, banner.status);
  }

  const parsedOrder = parseInteger(payload.display_order);
  if (parsedOrder !== undefined) {
    updatePayload.display_order = parsedOrder;
  }

  await banner.update(updatePayload, { transaction });

  return { action: "updated", banner };
};

export const getPromotionalBannerList = async (req, res) => {
  try {
    const { status, section_key, key } = req.query;
    const where = {};

    const normalizedStatus = normalizeStatus(status);
    if (normalizedStatus) {
      where.status = normalizedStatus;
    }

    const bannerKey = section_key || key;
    if (bannerKey) {
      where.section_key = bannerKey;
    }

    const banners = await models.PromotionalBanner.findAll({
      where,
      order: [
        ["display_order", "ASC"],
        ["id", "ASC"],
      ],
    });

    return res.json({
      status: true,
      message: "Promotional banners fetched successfully",
      data: banners,
      total: banners.length,
    });
  } catch (error) {
    console.error("Get promotional banners error:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const getSinglePromotionalBanner = async (req, res) => {
  try {
    const { id, section_key, key } = req.query;
    const bannerKey = section_key || key;

    if (!id && !bannerKey) {
      return res.status(400).json({
        status: false,
        message: "Either id or section_key is required",
      });
    }

    const banner = await resolveBannerIdentifier({ id, sectionKey: bannerKey });

    if (!banner) {
      return res.json({ status: false, message: "Promotional banner not found" });
    }

    return res.json({
      status: true,
      message: "Promotional banner fetched successfully",
      data: banner,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const addOrEditPromotionalBanner = async (req, res) => {
  try {
    const fileDictionary = buildFileDictionary(req.files);
    const sectionKeyFallback = req.body?.section_key || req.body?.key;
    let bannerPayloads;

    try {
      bannerPayloads = extractBannerPayloads(req.body);
    } catch (parseError) {
      const statusCode = parseError.statusCode || 500;
      return res.status(statusCode).json({ status: false, message: parseError.message });
    }

    const filesToDelete = [];
    const transaction = await models.sequelize.transaction();
    const processedResults = [];

    try {
      for (const payload of bannerPayloads) {
        const result = await processSinglePromotionalBanner({
          payload,
          sectionKeyFallback,
          fileDictionary,
          transaction,
          filesToDelete,
        });

        processedResults.push(result);
      }

      await transaction.commit();
    } catch (processingError) {
      await transaction.rollback();
      const statusCode = processingError.statusCode || 500;
      console.error("Add/Edit promotional banner error:", processingError);
      return res.status(statusCode).json({ status: false, message: processingError.message });
    }

    if (filesToDelete.length) {
      await Promise.all(filesToDelete.map((path) => deleteFile(path)));
    }

    if (processedResults.length == 1) {
      const [result] = processedResults;
      return res.json({
        status: true,
        message:
          result.action == "created"
            ? "Promotional banner created successfully"
            : "Promotional banner updated successfully",
        data: result.banner,
      });
    }

    return res.json({
      status: true,
      message: "Promotional banners processed successfully",
      data: processedResults.map((item) => item.banner),
    });
  } catch (error) {
    console.error("Add/Edit promotional banner error:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const deletePromotionalBanner = async (req, res) => {
  try {
    const { id } = req.body;

    const banner = await models.PromotionalBanner.findOne({ where: { id } });
    if (!banner) {
      return res.json({ status: false, message: "Promotional banner not found" });
    }

    if (banner.image) {
      await deleteFile(banner.image);
    }

    await banner.destroy();

    return res.json({
      status: true,
      message: "Promotional banner deleted successfully",
    });
  } catch (error) {
    console.error("Delete promotional banner error:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};


