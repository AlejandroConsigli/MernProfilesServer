const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");

const User = require("../models/User");
const Profile = require("../models/Profile");

router.put(
    "/",
    [
        auth,
        [
            check("name", "Name is required").not().isEmpty(),
            check("lastname", "Last name is required").not().isEmpty(),
        ],
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, lastname } = req.body;

        try {
            let userFields = {};

            userFields.name = name;
            userFields.lastname = lastname;

            user = await User.findOneAndUpdate(
                { _id: req.user.id },
                { $set: userFields },
                { new: true }
            ).select("-password");

            res.status(200).json(user);
        } catch (err) {
            console.error(err);
            res.status(500).send("Server Error");
        }
    }
);

router.put(
    "/password",
    [auth, [check("password", "Password with 6 or more characters").isLength({ min: 6 })]],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { password } = req.body;

        try {
            let userFields = {};

            const salt = await bcrypt.genSalt(10);
            userFields.password = await bcrypt.hash(password, salt);

            user = await User.findOneAndUpdate(
                { _id: req.user.id },
                { $set: userFields },
                { new: true }
            ).select("-password");

            res.status(200).json(user);
        } catch (err) {
            console.error(err);
            res.status(500).send("Server Error");
        }
    }
);

router.delete("/", auth, async (req, res) => {
    try {
        await User.findOneAndRemove({ _id: req.user.id });
        await Profile.findOneAndRemove({ user: req.user.id });

        res.status(200).json({ msg: "User deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
