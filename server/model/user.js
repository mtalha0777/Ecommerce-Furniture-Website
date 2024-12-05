const mongoose = require('mongoose')

const eappschema = new mongoose.Schema({
        name: String,
        email: String,
        password: String,
        phoneNumber: { type: String, required: false },
        profilePicture: { type: String, required: false },
        role: String,
        firstLogin: Boolean
})

const usermodel = mongoose.model("logins", eappschema)

module.exports = usermodel