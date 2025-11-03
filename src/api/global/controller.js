import { uploadFolder } from "../../common/constant/appConstants.js";
import fs from "fs";
import path from "path";

export const uploadFile = async (req, res) => {
    try {
      const { folder } = req.query;
  
      if (!req.file) {
        return res.send({ status: false, message: "No file uploaded" });
      }
  
      const filePath = `assets/${folder}/${req.file.filename}`;
  
      return res.json({
        status: true,
        message: "File uploaded successfully",
        path: filePath,
      });
    } catch (error) {
      return res.send({ status: false, message: error.message });
    }
  };

export const deleteFile = async (req, res) => {
  try {
    const { file_path } = req.params;

    if (!file_path) {
      return res.send({ status: false, message: "File delete"});
    }

    // Resolve the absolute file path
    const absolutePath = path.join(process.cwd(), file_path);

    // Check if the file exists
    if (!fs.existsSync(absolutePath)) {
      return res.send({ status: false, message: "File not found" });
    }

    // Delete the file
    fs.unlinkSync(absolutePath);

    return res.send({ status: true, message: "File deleted" });

  } catch (error) {
    console.error("Error deleting file:", error);
    return res.send({ status: false, message: error.message});
  }
};
