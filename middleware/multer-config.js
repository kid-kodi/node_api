const multer = require("multer");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();

const maxSize = 10 * 1024 * 1024; // 10MB

// Image config
const imageMsgFileStorage = multer.diskStorage({
  destination: `uploads/${process.env.IMAGE_PATH}`,
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const uploadImage = multer({
  storage: imageMsgFileStorage,
  limits: { fileSize: maxSize },
}).single("imageMsg");

// Image config
const otherFileStorage = multer.diskStorage({
  destination: `uploads/${process.env.FILE_PATH}`,
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const uploadOther = multer({
  storage: otherFileStorage,
  limits: { fileSize: maxSize },
}).single("file");

// Audio config
const audioMsgFileStorage = multer.diskStorage({
  destination: `uploads/${process.env.AUDIO_PATH}`,
  filename: (req, file, cb) => {
    cb(null, Date.now() + ".mp3");
  },
});

const uploadAudio = multer({
  storage: audioMsgFileStorage,
  limits: { fileSize: 5000 * 1024 * 1024 },
}).single("track");

module.exports = { uploadImage, uploadAudio, uploadOther };
