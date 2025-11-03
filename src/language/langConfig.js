import en from "./lang_en.js";

const messages = {
  en
};

export const messageData = (lang = "en", key) => {
  return messages[lang]?.[key] || messages["en"][key] || "Message not found";
};
