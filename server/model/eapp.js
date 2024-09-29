

const mongoose= require('mongoose')

const  eappschema = new mongoose.Schema({

        name:String,
        email:String,
        password:String



})

const eappmodel = mongoose.model("logins",eappschema)

module.exports = eappmodel