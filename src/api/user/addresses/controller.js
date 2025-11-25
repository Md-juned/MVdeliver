import models from "../../../models/index.js";

export const addAddress = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { name, email, phone, address, latitude, longitude, delivery_type, is_default } = req.body;

    if (!name || !address) {
      return res.status(400).json({
        status: false,
        message: "Name and address are required",
      });
    }

    // If this is set as default, unset other default addresses
    if (is_default) {
      await models.Address.update(
        { is_default: false },
        { where: { user_id, is_default: true } }
      );
    }

    const newAddress = await models.Address.create({
      user_id,
      name,
      email: email || null,
      phone: phone || null,
      address,
      latitude: latitude || null,
      longitude: longitude || null,
      delivery_type: delivery_type || "Home",
      is_default: is_default || false,
    });

    return res.json({
      status: true,
      message: "Address added successfully",
      data: newAddress,
    });
  } catch (error) {
    console.error("addAddress error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getAddresses = async (req, res) => {
  try {
    const user_id = req.user.id;

    const addresses = await models.Address.findAll({
      where: { user_id },
      order: [
        ["is_default", "DESC"],
        ["created_at", "DESC"],
      ],
    });

    return res.json({
      status: true,
      message: "Addresses fetched successfully",
      data: addresses,
    });
  } catch (error) {
    console.error("getAddresses error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { id } = req.params;
    const { name, email, phone, address, latitude, longitude, delivery_type, is_default } = req.body;

    const addressRecord = await models.Address.findOne({
      where: { id, user_id },
    });

    if (!addressRecord) {
      return res.status(404).json({
        status: false,
        message: "Address not found",
      });
    }

    // If this is set as default, unset other default addresses
    if (is_default && !addressRecord.is_default) {
      await models.Address.update(
        { is_default: false },
        { where: { user_id, is_default: true } }
      );
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email || null;
    if (phone !== undefined) updateData.phone = phone || null;
    if (address !== undefined) updateData.address = address;
    if (latitude !== undefined) updateData.latitude = latitude || null;
    if (longitude !== undefined) updateData.longitude = longitude || null;
    if (delivery_type !== undefined) updateData.delivery_type = delivery_type;
    if (is_default !== undefined) updateData.is_default = is_default;

    await addressRecord.update(updateData);

    return res.json({
      status: true,
      message: "Address updated successfully",
      data: addressRecord,
    });
  } catch (error) {
    console.error("updateAddress error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const removeAddress = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { id } = req.params;

    const addressRecord = await models.Address.findOne({
      where: { id, user_id },
    });

    if (!addressRecord) {
      return res.status(404).json({
        status: false,
        message: "Address not found",
      });
    }

    await addressRecord.destroy();

    return res.json({
      status: true,
      message: "Address removed successfully",
    });
  } catch (error) {
    console.error("removeAddress error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

