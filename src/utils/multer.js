import multer from "multer";
import path from "path";
import fs from "fs";

// // Multer Storage Configuration
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const folder = req.query.folder || "others"; 
//     const uploadPath = `assets/${folder}`;

//     // Ensure the folder exists
//     fs.mkdirSync(uploadPath, { recursive: true });

//     cb(null, uploadPath);
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
//   },
// });

// // Multer Upload Instance
// const upload = multer({ storage });

// export default upload;



export default function upload(folderName = "others") {
  
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = `assets/${folderName}`;

      // Create folder if not exists
      fs.mkdirSync(uploadPath, { recursive: true });

      cb(null, uploadPath);
    },

    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
  });

  return multer({ storage });
}

