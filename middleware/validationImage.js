const fs = require("fs");

module.exports = (req, res, next) => {
    if (typeof req.file === "undefined" || typeof req.body === "undefined") {
        return res.status(400).json({ msg: "Image is required" });
    }

    const image = req.file.path;

    if (
        !req.file.mimetype.includes("jpeg") &&
        !req.file.mimetype.includes("jpg") &&
        !req.file.mimetype.includes("png")
    ) {
        fs.unlinkSync(image);
        return res.status(415).json({ msg: "Format not supported" });
    }

    next();
};
