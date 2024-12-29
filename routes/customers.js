const express = require("express");
const Customer = require("../models/Customer");
const router = express.Router();
const formidable = require("formidable");
const excelToJson = require("convert-excel-to-json");

// CREATE A CUSTOMER
// URL : http://localhost:5000/customers
// METHOD : POST
// REQUEST : { email, telephone, password }
// RESPONSE SUCCESS
// RESPONSE : STATUS - 201
// RESPONSE ERROR
// RESPONSE : STATUS - 401
router.post("/", async (req, res, next) => {
  try {
    const customer = new Customer(req.body);
    const response = await customer.save();
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

// GET USERS
// URL : http://localhost:5000/customers/search?page=1
// METHOD : GET
// REQUEST : null
// RESPONSE SUCCESS
// RESPONSE : STATUS - 201 [{Customer}]
// RESPONSE ERROR
// RESPONSE : STATUS - 401
router.get("/search", async (req, res, next) => {
  try {
    let keyword = req.query.q
      ? {
          raisonSociale: { $regex: req.query.q, $options: "i" },
        }
      : {};
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.size) || 5;

    const count = await Customer.countDocuments({ ...keyword });
    const pages = Math.ceil(count / pageSize);

    const customers = await Customer.find({ ...keyword })
      .select(
        "raisonSociale sigle numeroCC emailEntite telephoneEntite createdAt"
      )
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort("-updatedAt");

    res.send({ customers, page, pages });
  } catch (error) {
    next(error);
  }
});

// GET USERS
// URL : http://localhost:5000/customers
// METHOD : GET
// REQUEST : null
// RESPONSE SUCCESS
// RESPONSE : STATUS - 201 [{Customer}]
// RESPONSE ERROR
// RESPONSE : STATUS - 401
router.get("/", async (req, res, next) => {
  try {
    let customers = await Customer.find().select(
      "raisonSociale sigle numeroCC emailEntite telephoneEntite createdAt"
    );
    res.status(201).json(customers);
  } catch (error) {
    next(error);
  }
});

// GET A CUSTOMER
// URL : http://localhost:5000/customers/:customerId
// METHOD : GET
// REQUEST : null
// RESPONSE SUCCESS
// RESPONSE : STATUS - 201 [{Customer}]
// RESPONSE ERROR
// RESPONSE : STATUS - 401
router.get("/:id", async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    res.status(201).json(customer);
  } catch (error) {
    next(error);
  }
});

// UPDATE A CUSTOMER
// URL : http://localhost:5000/customers/:customerId
// METHOD : PUT
// REQUEST : { firstName, lastName, email, telephone, password }
// RESPONSE SUCCESS
// RESPONSE : STATUS - 201
// RESPONSE ERROR
// RESPONSE : STATUS - 401
router.put("/:customerId", async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.customerId,
      req.body,
      {
        new: true,
      }
    );
    res.status(201).json(customer);
  } catch (error) {
    next(error);
  }
});

// DELETE A CUSTOMER
// URL : http://localhost:5000/customers/:customerId
// METHOD : DELETE
// REQUEST : {ids : [id1,id2,...]}
// RESPONSE SUCCESS
// RESPONSE : STATUS - 201
// RESPONSE ERROR
// RESPONSE : STATUS - 401
router.post("/more", async (req, res, next) => {
  try {
    console.log(req.body);
    const response = await Customer.deleteMany({ _id: { $in: req.body.ids } });
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

// DELETE A CUSTOMER
// URL : http://localhost:5000/customers/:customerId
// METHOD : DELETE
// REQUEST : null
// RESPONSE SUCCESS
// RESPONSE : STATUS - 201
// RESPONSE ERROR
// RESPONSE : STATUS - 401
router.delete("/:id", async (req, res, next) => {
  try {
    const response = await Customer.findByIdAndDelete(req.params.id);
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

// //Delete more customers
// router.post("/more", async (req, res, next) => {
//   try {
//     const response = await Customer.deleteMany({ _id: { $in: req.body } });
//     res.status(201).json(response);
//   } catch (error) {
//     next(error);
//   }
// });

// import customers
router.post("/import", async (req, res, next) => {
  try {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, async (err, fields, files) => {
      if (err) {
        res.status(400).json({
          message: "Data could not be uploaded",
        });
      }

      // "raisonSociale sigle numeroCC emailEntite telephoneEntite createdAt"

      const { data } = excelToJson({
        sourceFile: files.excelFile.filepath,
        columnToKey: {
          A: "raisonSociale",
          B: "sigle",
          C: "numeroCC",
          D: "emailEntite",
          E: "telephoneEntite",
        },
      });

      data.map(async (d) => {
        try {
          const customer = new Customer(d);
          const response = await customer.save();
          res.status(201).json(response);
        } catch (error) {
          next(error);
        }
      });
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
