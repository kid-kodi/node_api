const express = require("express");
const CatchAsyncError = require("../helpers/CatchAsyncError");
const Errors = require("../helpers/Errors");
const auth = require("../middleware/auth");
const Message = require("../models/Message");
const Chat = require("../models/Chat");

const router = express.Router();

router.get(
  "/:chatId",
  CatchAsyncError(async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;
      const totalMessages = await Message.countDocuments({ chat: req.params.chatId });

      const messages = await Message.find({ chat: req.params.chatId })
        .populate("replyTo.message")
        .populate("replyTo.user", "_id, profilePicture, fullName")
        .populate("sender", "_id, profilePicture, fullName")
        .populate("file")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

      res.status(201).json({
        success: true,
        message: "Messages found !",
        messages: messages,
        count: totalMessages,
      });
    } catch (error) {
      next(new Errors(error.message, 400));
    }
  })
);

router.put(
  "/:messageId/like",
  auth,
  CatchAsyncError(async (req, res, next) => {
    try {
    } catch (error) {
      next(new Errors(error.message, 400));
    }
  })
);

router.put(
  "/:messageId/unlike",
  auth,
  CatchAsyncError(async (req, res, next) => {
    try {
    } catch (error) {
      next(new Errors(error.message, 400));
    }
  })
);

router.post(
  "/remove",
  auth,
  CatchAsyncError(async (req, res, next) => {
    try {
      console.log(req.body);
      const response = await Message.deleteMany({ _id: { $in: req.body.ids } });
      res.status(201).json({success: true, data : response});
    } catch (error) {
      console.log(error)
      next(new Errors(error.message, 400));
    }
  })
);

router.post(
  "/:chatId",
  auth,
  CatchAsyncError(async (req, res, next) => {
    try {
      // create new messages

      const message = await Message(req.body);
      message.sender = req.user._id;
      message.chat = req.params.chatId;
      const response = await message.save();

      await response.populate("replyTo.message");
      await response.populate("replyTo.user");
      await response.populate("sender", "_id, profilePicture, fullName");
      await response.populate("chat");
      await response.populate("file");
      await Chat.findByIdAndUpdate(response.chat, {
        $set: { lastMessage: response._id, lastTimeMessageRead: Date.now() },
      });
      res.status(201).json({
        success: true,
        message: "Message successfully created !",
        data: response,
      });
    } catch (error) {
      next(new Errors(error.message, 400));
    }
  })
);



module.exports = router;
