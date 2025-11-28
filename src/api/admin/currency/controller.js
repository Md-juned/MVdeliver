import models from "../../../models/index.js";
import { deleteFile } from "../../../utils/fileUtils.js";

const { Op } = models.Sequelize;


const normalizeStatus = (value, fallback = "active") => {
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

const parseBoolean = (value, fallback = false) => {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;

  const lowered = String(value).toLowerCase();
  if (["true", "1", "yes", "enable", "enabled", "on"].includes(lowered)) return true;
  if (["false", "0", "no", "disable", "disabled", "off"].includes(lowered)) return false;
  return fallback;
};

const CURRENCY_POSITIONS = [
  "before_price",
  "before_price_with_space",
  "after_price",
  "after_price_with_space",
];

const normalizePosition = (value, fallback = CURRENCY_POSITIONS[0]) => {
  if (!value) return fallback;
  const lowered = String(value).toLowerCase();
  if (CURRENCY_POSITIONS.includes(lowered)) {
    return lowered;
  }

  if (lowered === "before") return "before_price";
  if (lowered === "after") return "after_price";

  return fallback;
};

const parseRate = (value, fallback = 1) => {
  if (value === undefined || value === null || value === "") return fallback;
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
};

const uppercaseOrNull = (value) => {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed ? trimmed.toUpperCase() : null;
};

const buildSearchCondition = (search) => {
  if (!search) return [];
  return [
    { name: { [Op.like]: `%${search}%` } },
    { code: { [Op.like]: `%${search}%` } },
    { country_code: { [Op.like]: `%${search}%` } },
  ];
};

const ensureSingleDefault = async ({ currencyId, transaction }) => {
  await models.Currency.update(
    { is_default: false },
    {
      where: {
        id: {
          [Op.ne]: currencyId,
        },
      },
      transaction,
    }
  );

  await models.Currency.update({ is_default: true }, { where: { id: currencyId }, transaction });
};

export const addOrEditCurrency = async (req, res) => {
  try {
    const { id, name, code, country_code, rate, currency_position, status, make_default, icon } = req.body;

    if (!name || !code) {
      return res.status(400).json({ status: false, message: "Name and code are required" });
    }

     // ---- UNIQUE CHECK ----
     let where = { code: code.toUpperCase() };
     if (id) where.id = { [Op.ne]: id };  // ignore the current record during update
 
     const existingCode = await models.Currency.findOne({ where });
     if (existingCode) {
       return res.json({
         status: false,
         message: "Please enter a unique currency code",
       });
     }
     // ---- END UNIQUE CHECK ----

    const allowedPositions = [
      "before_price",
      "before_price_with_space",
      "after_price",
      "after_price_with_space",
    ];

    const position = allowedPositions.includes(currency_position) ? currency_position : "before_price";
    const numericRate = Number(rate) > 0 ? Number(rate) : 1;
    const currentStatus = status === "inactive" ? "inactive" : "active";
    const isDefault = make_default ? true : false;

    // ------------------
    // UPDATE
    // ------------------
    if (id) {
      const currency = await models.Currency.findByPk(id);
      if (!currency) return res.status(404).json({ status: false, message: "Currency not found" });

      await currency.update({
        name,
        code: code.toUpperCase(),
        country_code: country_code ? country_code.toUpperCase() : null,
        icon: icon ?? currency.icon,
        rate: numericRate,
        currency_position: position,
        status: currentStatus,
        is_default: isDefault,
      });

      if (isDefault) {
        await ensureSingleDefault({ currencyId: currency.id });
      }

      return res.json({ status: true, message: "Currency updated successfully", data: currency });
    }

    // ------------------
    // CREATE
    // ------------------
    let payload = {
      name,
      code: code.toUpperCase(),
      country_code: country_code ? country_code.toUpperCase() : null,
      icon: icon ?? null,
      rate: numericRate,
      currency_position: position,
      status: currentStatus,
      is_default: isDefault,
    };
  
   
    const defaultExist = await models.Currency.count({ where: { is_default: true } });
    
    if (!payload.is_default && defaultExist === 0) payload.is_default = true;
  //  console.log("-----------------------------sssssssssssssssssssssssssssss----------------------",payload)
    const newCurrency = await models.Currency.create(payload);
    
    if (payload.is_default) {
      await ensureSingleDefault({ currencyId: newCurrency.id });
    }

    return res.json({ status: true, message: "Currency created successfully", data: newCurrency });
  } catch (error) {
    // console.log("------------------------------------error------------------------------------",error)
    return res.status(500).json({ status: false, message: error.message });
  }
};


export const getCurrencyList = async (req, res) => {
  try {
    const { page, limit, search = "", status } = req.query;

    const where = {};

    if (search) {
      where[Op.or] = buildSearchCondition(search);
    }

    if (status) {
      where.status = normalizeStatus(status);
    }

    const order = [
      ["is_default", "DESC"],
      ["name", "ASC"],
    ];

    if (!page || !limit) {
      const currencies = await models.Currency.findAll({ where, order });
      return res.json({
        status: true,
        message: "Currency list fetched successfully",
        data: currencies,
        total: currencies.length,
        currentPage: null,
        totalPages: null,
      });
    }

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const offset = (pageNumber - 1) * limitNumber;

    const currencies = await models.Currency.findAndCountAll({
      where,
      limit: limitNumber,
      offset,
      order,
    });

    return res.json({
      status: true,
      message: "Currency list fetched successfully",
      data: currencies.rows,
      total: currencies.count,
      currentPage: pageNumber,
      totalPages: Math.ceil(currencies.count / limitNumber),
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const getSingleCurrency = async (req, res) => {
  try {
    const { id } = req.query;
    const currency = await models.Currency.findByPk(id);

    if (!currency) {
      return res.status(404).json({ status: false, message: "Currency not found" });
    }

    return res.json({
      status: true,
      message: "Currency fetched successfully",
      data: currency,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const deleteCurrency = async (req, res) => {
  const transaction = await models.sequelize.transaction();

  try {
    const { id } = req.body;
    const currency = await models.Currency.findByPk(id, { transaction });

    if (!currency) {
      await transaction.rollback();
      return res.status(404).json({ status: false, message: "Currency not found" });
    }

    if (currency.icon) {
      await deleteFile(currency.icon);
    }

    const wasDefault = currency.is_default;

    await currency.destroy({ transaction });

    if (wasDefault) {
      const replacement = await models.Currency.findOne({
        where: { id: { [Op.ne]: id } },
        order: [["id", "ASC"]],
        transaction,
      });

      if (replacement) {
        await models.Currency.update(
          { is_default: true },
          { where: { id: replacement.id }, transaction }
        );
      }
    }

    await transaction.commit();
    return res.json({
      status: true,
      message: "Currency deleted successfully",
    });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({ status: false, message: error.message });
  }
};

