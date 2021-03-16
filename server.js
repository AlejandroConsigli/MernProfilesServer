const express = require("express");
const morgan = require("morgan");
const app = express();
const path = require("path");
const cors = require("cors");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

connectDB();

app.use("/files", express.static("files"));
app.use(morgan("dev"));
app.use(cors());
app.use(express.json({ extended: false }));

app.listen(PORT, (req, res) => {
    console.log(`Server started on port ${PORT}`);
});

app.get("/api/", (req, res) => {
    res.send("Profiles Api");
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/profiles", require("./routes/profiles"));
app.use("/api/user", require("./routes/user"));
app.use("/api/files", require("./routes/files"));

// if(process.env.NODE_ENV === "production") {
//     app.use(express.static("client/build"));
    
//     app.get("*", (req, res) => {
//         res.sendFile(path.resolve(__dirname, "client", "build", "index.html"))
//     })
// }
// "heroku-postbuild": "NPM_CONFIG_PRODUCTION=false npm run i-client && npm run b-client"
