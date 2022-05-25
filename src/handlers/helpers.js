const cloudinary = require('cloudinary').v2
const multer = require("multer");


require('dotenv').config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
  secure: true,
});

const diskStorage = multer.diskStorage({
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },

  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const singleFileUpload = (name) => {
  return multer({
    storage: diskStorage,
  }).single(name);
}

const multipleFileUpload = (name) => {
  return multer({
    storage: diskStorage,
  }).array(name);
}

const helpers = {
  cloudinary,
  singleFileUpload,
  multipleFileUpload
}

module.exports = helpers