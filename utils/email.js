const nodemailer = require("nodemailer");

sendEmail = (email, subject, html, res) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "mernprofiles7@gmail.com",
            pass: "Mern_profiles_7",
        },
    });

    const mailOptions = {
        from: "<mernprofiles7@gmail.com>",
        to: email,
        subject,
        html,
    };

    transporter.sendMail(mailOptions, (err) => {
        if(err) {
            res.status(502).json({ msg: "Email sent error", err });
            console.log(err);
        } else {
            res.status(200).json("Email sent");
        }
    });
};

module.exports = sendEmail;
