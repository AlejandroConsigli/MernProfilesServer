const express = require("express");
const router = express.Router();
const sharp = require("sharp");
const fs = require("fs");
const auth = require("../middleware/auth");
const multerImage = require("../middleware/multerImage");
const validationImage = require("../middleware/validationImage");
const config = require("config");
const storagePath = config.get("storagePath");

router.post("/:id", auth, multerImage, validationImage, async (req, res) => {
    try {
        const url = `${req.protocol}://${req.headers.host}/`;
        const original = req.file.path;
        const compress = original.replace("original", "compress");
        const imageUrl = url + compress;

        fs.readdir(storagePath, (err, files) => {
            files.forEach(file => {
                if(file.includes(req.params.id) && file.includes("compress")) {
                    fs.unlinkSync(`${storagePath}${file}`);
                }
            });
        });

        await sharp(original)
            .png({
                quality: 30
            })
            .rotate()
            .toFile(compress);

        fs.unlinkSync(original);
        res.status(200).json(imageUrl);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
