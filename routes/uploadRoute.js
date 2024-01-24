const express = require("express");
const multer = require("multer");
const Product = require("../models/Product.js");
const adminChecker = require("../middleware/adminChecker");
const { unlinkSync, rmSync, existsSync, mkdirSync } = require("fs");
const { join } = require("path");
const uploadFile = require("../utils/upload.js");

const router = express.Router();
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

router.post("/single/:id", uploads.single("image"), async (req, res) => {
  try {
    const product = await Product.findOne({ productID: req.params.id });

    const file = await req.file;
    const { path, filename, mimetype } = file;
    if (!formats.includes(mimetype)) {
      rmSync(storage, { recursive: true, force: true });
      return res.status(400).send({ error: "Invalid file type" });
    }
    const url = await uploadFile(path, filename, mimetype);
    product.image = url;
    await product.save();

    unlinkSync(path);
    res.send({ url: url });
  } catch (error) {
    console.error(error);
    res.status(400).send({ error: "Could not upload files" });
  }
});

router.post("/multiple/:id", uploads.array("images", 5), async (req, res) => {
  try {
    const product = await Product.findOne({ productID: req.params.id });

    const files = await req.files;
    let hasInvalidFile = false;
    const urls = await Promise.all(
      files.map(async (file) => {
        const { path, filename, mimetype } = file;
        if (!formats.includes(mimetype)) {
          unlinkSync(path);
          hasInvalidFile = true;
          return "none";
        }
        const response = await uploadFile(path, filename, mimetype);
        if (response.status !== "error") return response.url;
        if (response.status !== "error") return "none";
      })
    );

    if (hasInvalidFile) {
      return res.status(400).send({ error: "Invalid file type" });
    }
    product.images = urls;
    await product.save();

    files.map((file) => unlinkSync(file.path));
    res.send(urls);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Could not upload files" });
  }
});

router.post("/test", uploads.array("images", 5), async (req, res) => {
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

    console.log(urls);
    console.log(req.body.name);
    res.send(urls);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Could not upload files" });
  }
});

module.exports = router;
