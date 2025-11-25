
import fs from "fs";
import path from "path";

/**
 * Safely delete a file if it exists
 * @param {string} filePath - Path to the file to delete
 * @returns {Promise<boolean>} - Returns true if file was deleted, false otherwise
 */
export const deleteFile = async (filePath) => {
  if (!filePath) return false;
  
  try {
    // Check if file exists and is not a default placeholder
    if (fs.existsSync(filePath) && !filePath.includes("default-img.jpg")) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error.message);
    return false;
  }
};

