const express = require("express");
const User = require("../models/User");
const router = express.Router();
const formidable = require("formidable");
const excelToJson = require("convert-excel-to-json");
const Errors = require("../helpers/Errors");
const CatchAsyncError = require("../helpers/CatchAsyncError");

// CREATE A USER
// URL : http://localhost:5000/users
// METHOD : POST
// REQUEST : { email, telephone, password }
// RESPONSE SUCCESS
// RESPONSE : STATUS - 201
// RESPONSE ERROR
// RESPONSE : STATUS - 401
router.post(
  "/",
  CatchAsyncError(async (req, res, next) => {
    try {
      const user = new User(req.body);
      user.fullName = `${req.body.firstName} ${req.body.lastName}`;
      const response = await user.save();
      res.status(201).json({ success: true, data: response });
    } catch (error) {
      next(new Errors(error.message, 400));
    }
  })
);

// GET USERS
// URL : http://localhost:5000/users/search?page=1
// METHOD : GET
// REQUEST : null
// RESPONSE SUCCESS
// RESPONSE : STATUS - 201 [{User}]
// RESPONSE ERROR
// RESPONSE : STATUS - 401
router.get(
  "/search",
  CatchAsyncError(async (req, res, next) => {
    try {
      let keyword = req.query.q
        ? {
            fullName: { $regex: req.query.q, $options: "i" },
          }
        : {};
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.size) || 5;

      const count = await User.countDocuments({ ...keyword });
      const pages = Math.ceil(count / pageSize);

      const users = await User.find({ ...keyword })
        .select(
          "_id profilePicture initials fullName firstName lastName email telephone role createdAt"
        )
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .sort("-updatedAt");

      res.send({ users, page, pages });
    } catch (error) {
      next(new Errors(error.message, 400));
    }
  })
);

// GET USERS
// URL : http://localhost:5000/users
// METHOD : GET
// REQUEST : null
// RESPONSE SUCCESS
// RESPONSE : STATUS - 201 [{User}]
// RESPONSE ERROR
// RESPONSE : STATUS - 401
router.get(
  "/",
  CatchAsyncError(async (req, res, next) => {
    try {
      let users = await User.find().select(
        "_id profilePicture initials fullName firstName lastName email telephone role createdAt"
      );
      res.status(201).json(users);
    } catch (error) {
      next(new Errors(error.message, 400));
    }
  })
);

// GET A USER
// URL : http://localhost:5000/users/:userId
// METHOD : GET
// REQUEST : null
// RESPONSE SUCCESS
// RESPONSE : STATUS - 201 [{User}]
// RESPONSE ERROR
// RESPONSE : STATUS - 401
router.get(
  "/:id",
  CatchAsyncError(async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id).select(
        "_id profilePicture initials fullName firstName lastName email telephone role createdAt"
      );
      res.status(201).json({ success : true, user});
    } catch (error) {
      next(new Errors(error.message, 400));
    }
  })
);

// UPDATE A USER
// URL : http://localhost:5000/users/:userId
// METHOD : PUT
// REQUEST : { firstName, lastName, email, telephone, password }
// RESPONSE SUCCESS
// RESPONSE : STATUS - 201
// RESPONSE ERROR
// RESPONSE : STATUS - 401
router.put(
  "/:userId",
  CatchAsyncError(async (req, res, next) => {
    try {
      const user = await User.findByIdAndUpdate(req.params.userId, req.body, {
        new: true,
      });
      res
        .status(201)
        .json({ success: true, message: "Modification éffectuée", user });
    } catch (error) {
      next(new Errors(error.message, 400));
    }
  })
);

// DELETE A USER
// URL : http://localhost:5000/users/:userId
// METHOD : DELETE
// REQUEST : {ids : [id1,id2,...]}
// RESPONSE SUCCESS
// RESPONSE : STATUS - 201
// RESPONSE ERROR
// RESPONSE : STATUS - 401
router.post(
  "/more",
  CatchAsyncError(async (req, res, next) => {
    try {
      console.log(req.body);
      const response = await User.deleteMany({ _id: { $in: req.body.ids } });
      res.status(201).json(response);
    } catch (error) {
      next(new Errors(error.message, 400));
    }
  })
);

// DELETE A USER
// URL : http://localhost:5000/users/:userId
// METHOD : DELETE
// REQUEST : null
// RESPONSE SUCCESS
// RESPONSE : STATUS - 201
// RESPONSE ERROR
// RESPONSE : STATUS - 401
router.delete(
  "/:id",
  CatchAsyncError(async (req, res, next) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      res
        .status(201)
        .json({ success: true, message: "Utilisateur supprimé", user });
    } catch (error) {
      next(new Errors(error.message, 400));
    }
  })
);

// import users
router.post(
  "/import",
  CatchAsyncError(async (req, res, next) => {
    try {
      let form = new formidable.IncomingForm();
      form.keepExtensions = true;
      form.parse(req, async (err, fields, files) => {
        if (err) {
          res.status(400).json({
            message: "Data could not be uploaded",
          });
        }

        const { data } = excelToJson({
          sourceFile: files.excelFile.filepath,
          columnToKey: {
            A: "firstName",
            B: "lastName",
            C: "email",
            D: "telephone",
          },
        });

        data.map(async (d) => {
          try {
            const user = new User(d);
            user.fullName = `${d.firstName} ${d.lastName}`;
            const response = await user.save();
            res.status(201).json(response);
          } catch (error) {
            next(new Errors(error.message, 400));
          }
        });
      });
    } catch (error) {
      console.log(error);
      next(new Errors(error.message, 400));
    }
  })
);

module.exports = router;
