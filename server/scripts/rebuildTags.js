const Tag = require('./../models/Tag')
const User = require('./../models/User')
const Question = require('./../models/Question')
const mongoose = require('mongoose')
const debug = require('debug')('qa')
const pnr = s => {debug(s); return s}

function rebuildTags(){
	Question.collection.find({}, {tags: 1}).forEach(
		doc => doc.tags.forEach( t => Tag.updateCount(t) ),
		e => { if(e){console.error(e)}else{console.log('success')}}
	)
}

mongoose.connect('mongodb://localhost/qa', rebuildTags )
