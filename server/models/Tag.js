const bcrypt = require('bcrypt-nodejs')
const crypto = require('crypto')
const mongoose = require('mongoose')
const Question = require('./Question')
const debug_ = require('debug')('qa')
const debug = x => {debug_(x); return x}

const schema = new mongoose.Schema({
	name: {type: String, required: true, maxlength : 60},
	count: {type: Number},
	descriptions: {type: String, maxlength:200},
}, { timestamps: true })


schema.statics.updateCount = function(tagName){
	return Question.collection.count({tags: tagName})
	.then( x => this.collection.update(
		{name: tagName},
		{name: tagName, count: x},
		{upsert: true}
	))
}

const Tag = mongoose.model('Tag', schema)

Tag.collection.createIndex( {name: 1} , {unique: true })

module.exports = Tag
