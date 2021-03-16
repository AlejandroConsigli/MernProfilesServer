const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
    userData: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "collectionusers",
    },
    age: {
        type: Number,
        trim: true,
        required: true,
    },
    gender: {
        type: String,
        trim: true,
    },
    height: {
        type: Number,
        trim: true,
    },
    weight: {
        type: Number,
        trim: true,
    },
    image: {
        type: String,
        trim: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("collectionprofiles", ProfileSchema);
