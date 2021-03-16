const multer = require("multer");
const config = require("config");
const storagePath = config.get("storagePath");

const storage = multer.diskStorage({
    destination: (req, res, cb) => {
        cb(null, storagePath);
    },
    filename: (req, file, cb) => {
        cb(null, `original-${req.params.id}-${Date.now()}.png`);
    },
});

const images = multer({ storage });

module.exports = images.single("image");
