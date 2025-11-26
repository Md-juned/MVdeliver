import models from "../../../models/index.js";

export const contactTeam = async (req, res) => {
  try {
    const user_id = req.user?.id || null;
    const { name, email, phone, subject, message } = req.body;

    const payload = {
      user_id,
      name,
      email,
      phone: phone || null,
      subject,
      message,
    };

    const contactMessage = await models.ContactMessage.create(payload);

    return res.status(201).json({
      status: true,
      message: "Message submitted successfully. Our team will reach out soon.",
      data: contactMessage,
    });
  } catch (error) {
    console.error("contactTeam error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

