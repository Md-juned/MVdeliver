import models from "../../../models/index.js";

const { Op } = models.Sequelize;

const METHOD_STATUSES = ["active", "inactive"];
const REQUEST_STATUSES = ["pending", "approved", "rejected"];

const parseNumber = (value, fallback = null) => {
  if (value === undefined || value === null || value === "") return fallback;

  const parsed = Number(value);
  if (Number.isNaN(parsed)) return fallback;

  return parsed;
};

const normalizeStatus = (value, allowedValues, fallback) => {
  if (value === undefined || value === null || value === "") return fallback;

  const normalized = String(value).toLowerCase();
  if (allowedValues.includes(normalized)) {
    return normalized;
  }

  return fallback;
};

export const addOrEditDeliveryWithdrawMethod = async (req, res) => {
  try {
    const {
      id,
      name,
      minimum_amount,
      maximum_amount,
      withdraw_charge,
      description,
      status,
    } = req.body;

    const minAmount = parseNumber(minimum_amount);
    const maxAmount = parseNumber(maximum_amount);
    const charge = parseNumber(withdraw_charge);

    if (minAmount !== null && maxAmount !== null && minAmount > maxAmount) {
      return res.status(400).json({
        status: false,
        message: "Minimum amount cannot be greater than maximum amount",
      });
    }

    const normalizedStatus = normalizeStatus(
      status,
      METHOD_STATUSES,
      undefined
    );

    if (id) {
      const method = await models.DeliveryWithdrawMethod.findByPk(id);
      if (!method) {
        return res
          .status(404)
          .json({ status: false, message: "Delivery withdraw method not found" });
      }

      const payload = {};
      if (name !== undefined) payload.name = name;
      if (minAmount !== null) payload.minimum_amount = minAmount;
      if (maxAmount !== null) payload.maximum_amount = maxAmount;
      if (charge !== null) payload.withdraw_charge = charge;
      if (description !== undefined) payload.description = description;
      if (normalizedStatus) {
        payload.status = normalizedStatus;
      }

      await method.update(payload);

      return res.json({
        status: true,
        message: "Delivery withdraw method updated successfully",
        data: method,
      });
    }

    const newMethod = await models.DeliveryWithdrawMethod.create({
      name,
      minimum_amount: minAmount ?? 0,
      maximum_amount: maxAmount ?? 0,
      withdraw_charge: charge ?? 0,
      description,
      status: normalizedStatus ?? "inactive",
    });

    return res.json({
      status: true,
      message: "Delivery withdraw method created successfully",
      data: newMethod,
    });
  } catch (error) {
    console.error("Delivery withdraw method add/edit error:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const getDeliveryWithdrawMethodList = async (req, res) => {
  try {
    const { page, limit, search = "", status } = req.query;

    const where = {};

    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }

    const normalizedStatus = normalizeStatus(status, METHOD_STATUSES);
    if (normalizedStatus) {
      where.status = normalizedStatus;
    }

    const order = [
      ["status", "DESC"],
      ["id", "DESC"],
    ];

    if (!page || !limit) {
      const methods = await models.DeliveryWithdrawMethod.findAll({
        where,
        order,
      });

      return res.json({
        status: true,
        message: "Delivery withdraw methods fetched successfully",
        data: methods,
        total: methods.length,
        currentPage: null,
        totalPages: null,
      });
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    const result = await models.DeliveryWithdrawMethod.findAndCountAll({
      where,
      limit: limitNum,
      offset,
      order,
    });

    return res.json({
      status: true,
      message: "Delivery withdraw methods fetched successfully",
      data: result.rows,
      total: result.count,
      currentPage: pageNum,
      totalPages: Math.ceil(result.count / limitNum),
    });
  } catch (error) {
    console.error("Delivery withdraw method list error:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const getSingleDeliveryWithdrawMethod = async (req, res) => {
  try {
    const { id } = req.query;

    const method = await models.DeliveryWithdrawMethod.findByPk(id);

    if (!method) {
      return res
        .status(404)
        .json({ status: false, message: "Delivery withdraw method not found" });
    }

    return res.json({
      status: true,
      message: "Delivery withdraw method fetched successfully",
      data: method,
    });
  } catch (error) {
    console.error("Delivery withdraw method detail error:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const deleteDeliveryWithdrawMethod = async (req, res) => {
  try {
    const { id } = req.body;

    const method = await models.DeliveryWithdrawMethod.findByPk(id);
    if (!method) {
      return res
        .status(404)
        .json({ status: false, message: "Delivery withdraw method not found" });
    }

    const pendingRequests = await models.DeliveryWithdrawRequest.count({
      where: { delivery_withdraw_method_id: id },
    });

    if (pendingRequests > 0) {
      return res.status(400).json({
        status: false,
        message:
          "Cannot delete delivery withdraw method while requests are associated with it",
      });
    }

    await method.destroy();

    return res.json({
      status: true,
      message: "Delivery withdraw method deleted successfully",
    });
  } catch (error) {
    console.error("Delivery withdraw method delete error:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const getDeliveryWithdrawList = async (req, res) => {
  try {
    const { page, limit, search = "", status } = req.query;

    const where = {};

    const normalizedStatus = normalizeStatus(status, REQUEST_STATUSES);
    if (normalizedStatus) {
      where.status = normalizedStatus;
    }

    const include = [
      {
        model: models.Deliveryman,
        as: "deliveryman",
        attributes: ["id", "first_name", "email", "phone_number"],
      },
      {
        model: models.DeliveryWithdrawMethod,
        as: "delivery_withdraw_method",
        attributes: ["id", "name"],
      },
    ];

    const deliverymanFilter =
      search && search.trim()
        ? {
            [Op.or]: [
              { first_name: { [Op.like]: `%${search.trim()}%` } },
              { email: { [Op.like]: `%${search.trim()}%` } },
              { phone_number: { [Op.like]: `%${search.trim()}%` } },
            ],
          }
        : null;

    if (!page || !limit) {
      const requests = await models.DeliveryWithdrawRequest.findAll({
        where,
        include: include.map((clause) => {
          if (clause.as === "deliveryman" && deliverymanFilter) {
            return { ...clause, where: deliverymanFilter, required: true };
          }
          return clause;
        }),
        order: [
          ["status", "ASC"],
          ["id", "DESC"],
        ],
      });

      return res.json({
        status: true,
        message: "Delivery withdraw requests fetched successfully",
        data: requests,
        total: requests.length,
        currentPage: null,
        totalPages: null,
      });
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    const result = await models.DeliveryWithdrawRequest.findAndCountAll({
      where,
      limit: limitNum,
      offset,
      include: include.map((clause) => {
        if (clause.as === "deliveryman" && deliverymanFilter) {
          return { ...clause, where: deliverymanFilter, required: true };
        }
        return clause;
      }),
      distinct: true,
      order: [
        ["status", "ASC"],
        ["id", "DESC"],
      ],
    });

    return res.json({
      status: true,
      message: "Delivery withdraw requests fetched successfully",
      data: result.rows,
      total: result.count,
      currentPage: pageNum,
      totalPages: Math.ceil(result.count / limitNum),
    });
  } catch (error) {
    console.error("Delivery withdraw request list error:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const getDeliveryWithdrawDetail = async (req, res) => {
  try {
    const { id } = req.query;

    const request = await models.DeliveryWithdrawRequest.findByPk(id, {
      include: [
        {
          model: models.Deliveryman,
          as: "deliveryman",
          attributes: ["id", "first_name", "email", "phone_number"],
        },
        {
          model: models.DeliveryWithdrawMethod,
          as: "delivery_withdraw_method",
          attributes: ["id", "name", "withdraw_charge"],
        },
      ],
    });

    if (!request) {
      return res
        .status(404)
        .json({ status: false, message: "Delivery withdraw request not found" });
    }

    return res.json({
      status: true,
      message: "Delivery withdraw request fetched successfully",
      data: request,
    });
  } catch (error) {
    console.error("Delivery withdraw request detail error:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const updateDeliveryWithdrawStatus = async (req, res) => {
  try {
    const { id, status, description } = req.body;

    const normalizedStatus = normalizeStatus(status, REQUEST_STATUSES);
    if (!normalizedStatus || normalizedStatus === "pending") {
      return res.status(400).json({
        status: false,
        message: "Status must be either approved or rejected",
      });
    }

    const request = await models.DeliveryWithdrawRequest.findByPk(id);
    if (!request) {
      return res
        .status(404)
        .json({ status: false, message: "Delivery withdraw request not found" });
    }

    await request.update({
      status: normalizedStatus,
      description: description ?? request.description,
      processed_at: new Date(),
    });

    return res.json({
      status: true,
      message: `Delivery withdraw request ${normalizedStatus} successfully`,
      data: request,
    });
  } catch (error) {
    console.error("Delivery withdraw request status update error:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const deleteDeliveryWithdrawRequest = async (req, res) => {
  try {
    const { id } = req.body;

    const request = await models.DeliveryWithdrawRequest.findByPk(id);
    if (!request) {
      return res
        .status(404)
        .json({ status: false, message: "Delivery withdraw request not found" });
    }

    await request.destroy();

    return res.json({
      status: true,
      message: "Delivery withdraw request deleted successfully",
    });
  } catch (error) {
    console.error("Delivery withdraw request delete error:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};


