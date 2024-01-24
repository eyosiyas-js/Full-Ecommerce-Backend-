const express = require("express");
const multer = require("multer");
const Product = require("../models/Product");
const adminChecker = require("../middleware/adminChecker");
const { uid } = require("uid");
const { unlinkSync, rmSync, existsSync, mkdirSync } = require("fs");
const { join } = require("path");
const uploadFile = require("../utils/upload.js");

const storage = join(process.cwd(), "./uploads");
const formats = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/bmp",
  "image/webp",
  "image/tiff",
  "image/svg+xml",
  "image/x-icon",
];

if (!existsSync(storage)) {
  mkdirSync(storage);
}

const uploads = multer({ dest: storage });

const router = express.Router();

router.get("/find/:id", async (req, res) => {
  try {
    const product = await Product.findOne({ productID: req.params.id });
    res.send(product.toObject());
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ error: `Couldn't find a product with the ID: ${req.params.id}` });
  }
});

router.get("/all", async (req, res) => {
  try {
    const products = await Product.find({});
    res.send(products.map((product) => product.toObject()));
  } catch (error) {
    console.error(error);
    res.status(500).send("Error products");
  }
});

router.get("/related/:id", async (req, res) => {
  try {
    const product = await Product.findOne({ productID: req.params.id });

    if (!product)
      return res
        .status(400)
        .send({ error: `No product found with ID:  ${productID}` });

    const related_products = await Product.find({
      $and: [
        { productID: { $ne: product.productID } },
        {
          $or: [
            { category: { $regex: new RegExp(product.category, "i") } },
            { sub_category: { $regex: new RegExp(product.sub_category, "i") } },
            { brand: { $regex: new RegExp(product.brand, "i") } },
          ],
        },
      ],
    });

    if (related_products.length == 0)
      return res.status(400).send({ error: "No related products found" });
    res.send(related_products);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Error finding related products" });
  }
});

router.get("/category/:id", async (req, res) => {
  try {
    const product = await Product.find({ category: req.params.id });
    res.send(product);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      error: `Couldn't find products with category: ${req.params.id}`,
    });
  }
});

router.post(
  "/add",
  adminChecker,
  uploads.array("images", 10),
  async (req, res) => {
    try {
      const files = await req.files;
      let hasInvalidFile = false;
      const urls = await Promise.all(
        files.map(async (file) => {
          const { path, filename, mimetype } = file;
          if (!formats.includes(mimetype)) {
            unlinkSync(path);
            hasInvalidFile = true;
            return "none";
          } else {
            const response = await uploadFile(path, filename, mimetype);
            if (response.status !== "error") return response.url;
            if (response.status !== "error") return "none";
          }
        })
      );

      if (hasInvalidFile) {
        return res.status(400).send({ error: "Invalid file type" });
      }

      files.map((file) => unlinkSync(file.path));

      const { name, description, category, brand, price, countInStock } =
        req.body;

      const product = new Product({
        name: name,
        description: description,
        category: category,
        sub_category: req.body.sub_category ? req.body.sub_category : "",
        brand: brand,
        price: price,
        image: urls[0],
        images: urls,
        inStock: countInStock <= 0 ? false : true,
        countInStock: countInStock,
        productID: uid(16),
      });

      await product.save();

      res.send(product.toObject());
    } catch (error) {
      res.status(500).send({ error: "Error saving product" });
      console.log(error);
    }
  }
);

router.post(
  "/edit/:id",
  adminChecker,
  uploads.array("images", 10),
  async (req, res) => {
    async function update(req, res, images) {
      const urls = images || [];
      const { name, description, category, brand, price, countInStock } =
        req.body;

      const product = await Product.findOne({ productID: req.params.id });

      if (!product)
        return res
          .status(403)
          .send({ error: `No product with ID: ${req.params.id} found` });

      product.name = name;
      product.description = description;
      product.category = category;
      product.sub_category = req.body.sub_category ? req.body.sub_category : "";
      product.brand = brand;
      product.price = price;
      product.image = urls.length !== 0 ? urls[0] : product.image;
      product.images = urls.length !== 0 ? urls : product.images;
      product.inStock = countInStock <= 0 ? false : true;
      product.countInStock = countInStock;

      await product.save();

      res.send(product.toObject());
    }

    try {
      if (req.query.files == "true") {
        const files = await req.files;
        let hasInvalidFile = false;
        urls = await Promise.all(
          files.map(async (file) => {
            const { path, filename, mimetype } = file;
            if (!formats.includes(mimetype)) {
              unlinkSync(path);
              hasInvalidFile = true;
              return "none";
            } else {
              const response = await uploadFile(path, filename, mimetype);
              if (response.status !== "error") return response.url;
              if (response.status !== "error") return "none";
            }
          })
        );

        if (hasInvalidFile) {
          return res.status(400).send({ error: "Invalid file type" });
        }

        files.map((file) => unlinkSync(file.path));
        update(req, res, urls);
      } else {
        update(req, res);
      }
    } catch (error) {
      res.status(500).send({ error: "Error updating product" });
      console.log(error);
    }
  }
);

router.post("/delete/:id", adminChecker, async (req, res) => {
  try {
    const product = await Product.findOne({ productID: req.params.id });

    if (!product) {
      return res.status(404).send("Product not found");
    }

    await product.remove();

    res.send({ message: `Product with ID ${req.params.id} has been deleted` });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Error deleting product" });
  }
});

module.exports = router;
