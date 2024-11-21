const router = require("express").Router();
const CatchAsyncError = require("../helpers/CatchAsyncError");
const Errors = require("../helpers/Errors");
const auth = require("../middleware/auth");
const multerConfig = require("../middleware/multer-config");
const File = require("../models/File");
const dotenv = require("dotenv");
dotenv.config();

router.post(
  "/upload-img",
  auth,
  multerConfig.uploadImage,
  CatchAsyncError(async (req, res, next) => {
    try {
      const { filename } = req.file;
      const file = new File();
      file.name = filename;
      file.data = req.file;
      file.user = req.user._id;

      const data = await file.save();

      return res.status(200).json({ success: true, data });
    } catch (error) {
      return next(new Errors(error.message, 400));
    }
  })
);

router.post("/upload-audio", multerConfig.uploadAudio, (req, res) => {
  try {
    let filePath = "";
    if (req.file.filename) {
      filePath = `${process.env.HOST}/${process.env.AUDIO_PATH}/${req.file.filename}`;
    }
    return res.status(200).json(filePath);
  } catch (error) {
    console.error(error);
  }
});

module.exports = router;
