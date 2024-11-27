const express = require("express");
const CatchAsyncError = require("../helpers/CatchAsyncError");
const Errors = require("../helpers/Errors");
const Chat = require("../models/Chat");
const router = express.Router();

const auth = require("../middleware/auth");

router.post(
  "/",
  auth,
  CatchAsyncError(async (req, res, next) => {
    try {
      let response;
      let exist = false;

      if (req.body.chatName) {
        exist = await Chat.findOne({ chatName: req.body.chatName })
          .populate("users", "_id, fullName, profilePicture")
          .populate("lastMessage");
        console.log("exist1");
      } else {
        exist = await Chat.findOne({ users: req.body.users })
          .populate("users", "_id, fullName, profilePicture")
          .populate("lastMessage");
        console.log("exist2");
        console.log("exist");
      }

      if (exist) {
        response = exist;
      } else {
        req.body.owner = req.user._id;
        const chat = await Chat(req.body);
        response = await chat.save();

        await response.populate("users", "_id, profilePicture, fullName");
        await response.populate("lastMessage");
      }

      res.status(201).json({
        success: true,
        message: "Chat successfully created !",
        data: response,
      });
    } catch (error) {
      next(new Errors(error.message, 400));
    }
  })
);

router.get(
  "/",
  auth,
  CatchAsyncError(async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.size) || 10;

      const count = await Chat.countDocuments({
        users: { $in: [req.user._id] },
      });
      
      const pages = Math.ceil(count / pageSize);

      const chats = await Chat.find({
        users: { $in: [req.user._id] },
      })
        .populate({
          path: "users",
          select: "profilePicture fullName _id",
          match: {
            _id: {
              $ne: req.user._id,
            },
          },
        })
        .populate("lastMessage")
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .sort("-updatedAt");

      res.send({ success : true, chats, page, pages, count });
    } catch (error) {
      next(new Errors(error.message, 400));
    }
  })
);

router.get(
  "/search",
  auth,
  CatchAsyncError(async (req, res, next) => {
    try {
      let keyword = req.query.q
        ? {
            "lastMessage.content": { $regex: req.query.q, $options: "i" },
            users: { $in: [req.user._id] },
          }
        : {};

      const chats = await Chat.find({
        ...keyword,
        users: { $in: [req.user._id] },
      })
        .populate({
          path: "users",
          select: "profilePicture fullName _id",
          match: {
            _id: {
              $ne: req.user._id,
            },
          },
        })
        .populate("lastMessage")
        .limit(pageSize)
        .sort("-updatedAt");

      res.send({ chats });
    } catch (error) {
      next(new Errors(error.message, 400));
    }
  })
);

router.get(
  "/:chatId",
  auth,
  CatchAsyncError(async (req, res, next) => {
    try {
      const chat = await Chat.findByIdAndUpdate(
        req.params.chatId,
        { lastTimeMessageRead: Date.now() },
        { new: true }
      )
        .populate({
          path: "users",
          select: "profilePicture fullName _id",
          match: {
            _id: {
              $ne: req.user._id,
            },
          },
        })
        .populate("lastMessage");

      if (!chat) {
        next(new Errors("Chat not found!", 400));
      }

      res.status(201).json({
        success: true,
        message: "Chat found !",
        chat,
      });
    } catch (error) {
      next(new Errors(error.message, 400));
    }
  })
);

router.put(
  "/:chatId",
  auth,
  CatchAsyncError(async (req, res, next) => {
    try {
    } catch (error) {
      next(new Errors(error.message, 400));
    }
  })
);

router.get(
  "/common/:userId",
  auth,
  CatchAsyncError(async (req, res, next) => {
    try {
      const chats = await Chat.find({
        users: { $all: [req.user._id, req.params.userId] },
      })
        .populate({
          path: "users",
          select: "profilePicture fullName _id",
          match: {
            _id: {
              $ne: req.user._id,
            },
          },
        })
        .populate("lastMessage")
        .sort("-updatedAt");

      res.status(201).json({
        success: true,
        chats,
      });
    } catch (error) {
      next(new Errors(error.message, 400));
    }
  })
);

router.put(
  "/chatId/remove-users",
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
      const response = await Chat.deleteMany({ _id: { $in: req.body.ids } });
      res.status(201).json({success: true, data : response});
    } catch (error) {
      next(new Errors(error.message, 400));
    }
  })
);

module.exports = router;
