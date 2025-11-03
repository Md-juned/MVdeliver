import express from "express";
import Joi from "joi";
import upload from "../../utils/multer.js";
import {deleteFile, uploadFile } from "./controller.js";
import { validate } from "../../common/middleware/validation.middleware.js";

const router = express.Router();

// Upload Route
router.post(
  "/upload",
  validate(
    Joi.object({
      folder: Joi.string()
        .required(),
    }).unknown(true) 
  ),
  upload.single("file"),
  uploadFile
);

router.delete("/deleteFile/:file_path", deleteFile)

export default router;