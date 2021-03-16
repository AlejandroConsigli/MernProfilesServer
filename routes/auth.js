const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");
const sendEmail = require("../utils/email");

const User = require("../models/User");

router.get("/", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.status(200).json(user);
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Server Error");
    }
});

router.post(
    "/signin",
    [
        check("email", "Valid email is required").isEmail(),
        check("password", "Password is required").not().isEmpty(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;
        try {
            let user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({ errors: [{ msg: "Invalid credentials" }] });
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(401).json({ errors: [{ msg: "Invalid credentials" }] });
            }

            const payload = {
                user: {
                    id: user.id,
                },
            };
            const token = jwt.sign(payload, config.get("jwtSecret"), { expiresIn: 86400 });
            res.status(200).json({ token });
        } catch (err) {
            console.log(err.message);
            res.status(500).send("Server error");
        }
    }
);

router.post(
    "/signup",
    [
        check("email", "Valid email is required").isEmail(),
        check("name", "Name is required").not().isEmpty(),
        check("lastname", "Last name is required").not().isEmpty(),
        check("password", "Password with 6 or more characters").isLength({ min: 6 }),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(409).json({ errors: [{ msg: "User already exists" }] });
        }

        const payload = req.body;

        const token = jwt.sign(payload, config.get("jwtSecret"), { expiresIn: 1800 });

        const subject = "Account Verification";
        const html = `
            <h2>Please go to below link to activate your account</h2>
            <p>${req.headers.origin}/activate/${token}</p>
            <p><b>NOTE: </b> The above activation link expires in 30 minutes.</p>
            `;

        sendEmail(req.body.email, subject, html, res);
    }
);

router.get("/activate/:token", async (req, res) => {
    const token = req.params.token;

    if (token) {
        try {
            let decoded;
            try {
                decoded = jwt.verify(token, config.get("jwtSecret"));
            } catch {
                return res.status(401).json({ msg: "Token is invalid" });
            }
            const { name, lastname, email, password } = decoded;

            let user = await User.findOne({ email });
            if (user) {
                return res.status(409).json({ errors: [{ msg: "User already exists" }] });
            }

            user = new User({
                name,
                lastname,
                email,
                password,
            });

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            await user.save();

            const payload = {
                user: {
                    id: user.id,
                },
            };
            jwt.sign(payload, config.get("jwtSecret"), { expiresIn: 86400 });
            res.status(200).json({ token });
        } catch (err) {
            console.log(err.message);
            res.status(500).send("Server Error");
        }
    }
});

router.post("/forgot", [check("email", "Valid email is required").isEmail()], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    let user = await User.findOne({ email: req.body.email });
    if (!user) {
        return res.status(404).json({ errors: [{ msg: "User does not exists" }] });
    }

    const payload = {
        user: {
            id: user.id,
        },
    };

    const token = jwt.sign(payload, config.get("jwtSecret"), { expiresIn: 1800 });

    const subject = "Reset password";
    const html = `
        <h2>Please go to below link to reset your account password</h2>
        <p>${req.headers.origin}/reset/${token}</p>
        <p><b>NOTE: </b> The activation link expires in 30 minutes.</p>
        `;

    sendEmail(req.body.email, subject, html, res);
});

router.get("/reset/:token", async (req, res) => {
    const token = req.params.token;

    if (token) {
        try {
            let decoded;
            try {
                decoded = jwt.verify(token, config.get("jwtSecret"));
            } catch {
                return res.status(401).json({ msg: "Token is invalid" });
            }
            const { email, password } = decoded;

            let userFields = {};

            const salt = await bcrypt.genSalt(10);
            userFields.password = await bcrypt.hash(password, salt);

            user = await User.findOneAndUpdate(
                { email },
                { $set: userFields },
                { new: true }
            ).select("-password");

            const payload = {
                user: {
                    id: user.id,
                },
            };
            jwt.sign(payload, config.get("jwtSecret"), { expiresIn: 86400 });
            res.status(200).json({ token });
        } catch (err) {
            console.log(err.message);
            res.status(500).send("Server Error");
        }
    }
});

module.exports = router;
