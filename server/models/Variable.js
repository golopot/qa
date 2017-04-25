// intended to be use as a key value pair collection

const mongoose = require('mongoose');

const schema = new mongoose.Schema({

}, { timestamps: true });


const model = mongoose.model('Variables', schema);




module.exports = model
