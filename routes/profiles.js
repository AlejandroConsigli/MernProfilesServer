const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { check, validationResult } = require("express-validator");

const Profile = require("../models/Profile");

router.get("/me", auth, async (req, res) => {
    try {
        const profiles = await Profile.find();
        const profile = await Profile.findOne({
            userData: req.user.id,
        }).populate("userData", ["name", "lastname"]);

        if (!profile) {
            return res.status(404).json({ msg: "Profile not found" });
        }

        res.status(200).json(profile);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

router.post(
    "/",
    [
        auth,
        [
            check("age", "Valid age is required").isInt({ min: 1, max: 120 }),
            check("gender", "Gender is required").not().isEmpty(),
        ],
    ],
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let profile = await Profile.findOne({ userData: req.user.id }).populate("userData", [
            "name",
            "lastname",
        ]);

        if (profile) {
            return res.status(409).json({ errors: [{ msg: "Profile already exists" }] });
        }

        const { age, gender, height, weight, image } = req.body;

        const profileFields = {};

        profileFields.userData = req.user.id;
        profileFields.age = age;
        profileFields.gender = gender;
        profileFields.height = height;
        profileFields.weight = weight;
        profileFields.image = image;

        try {
            profile = new Profile(profileFields);
            await profile.save();

            res.status(200).json(profile);
        } catch (err) {
            console.error(err);
            res.status(500).send("Server Error");
        }
    }
);

router.put(
    "/",
    [
        auth,
        [
            check("age", "Valid age is required").isInt({ min: 1, max: 120 }),
            check("gender", "Gender is required").not().isEmpty(),
        ],
    ],
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { age, gender, height, weight, image } = req.body;

        const profileFields = {};

        profileFields.userData = req.user.id;
        profileFields.age = age;
        profileFields.gender = gender;
        profileFields.height = height;
        profileFields.weight = weight;
        profileFields.image = image;

        try {
            profile = await Profile.findOneAndUpdate(
                { userData: req.user.id },
                { $set: profileFields },
                { new: true }
            ).populate("userData", ["name", "lastname"]);

            res.status(200).json(profile);
        } catch (err) {
            console.error(err);
            res.status(500).send("Server Error");
        }
    }
);

router.get("/", auth, async (req, res) => {
    try {
        let profiles = await Profile.find().populate("userData", ["name", "lastname"]);
        if (req.query.search)
            profiles = profiles.filter(
                (item) =>
                    item.userData.name.toLowerCase().includes(req.query.search.toLowerCase()) ||
                    item.userData.lastname.toLowerCase().includes(req.query.search.toLowerCase()) ||
                    (item.userData.name + " " + item.userData.lastname)
                        .toLowerCase()
                        .includes(req.query.search.toLowerCase())
            );
        res.status(200).json(profiles);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

router.get("/user/:user_id", auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ userData: req.params.user_id }).populate("userData", [
            "name",
            "lastname",
        ]);

        if (!profile) {
            return res.status(404).json({ msg: "Profile not found" });
        }

        res.status(200).json(profile);
    } catch (err) {
        console.error(err);
        if (err.kind === "ObjectId") {
            return res.status(404).json({ msg: "Profile not found" });
        }
        res.status(500).send("Server Error");
    }
});

router.delete("/", auth, async (req, res) => {
    try {
        await Profile.findOneAndRemove({ userData: req.user.id });

        res.status(200).json({ msg: "Profile deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
