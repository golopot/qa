require('dotenv').config({path: '../env'})
const debug = require('debug')('qa')
const mongoose = require('mongoose')
mongoose.connect( 'mongodb://localhost/qa' )
mongoose.Promise = global.Promise
const express = require('express')
const api = require( './api/api')
const path = require('path')
const Tag = require('./models/Tag')
const Question = require('./models/Question')
const clientPath =  path.normalize( __dirname + '/../client/build')
const fs = require('fs')
const oauthGoogleJs = fs.readFileSync('./oauth/oauth-callback-google.js')
const app = express()



// custom properties
app.use( (req,res,next) => {

	res.sent = false

	res.sendApp = function sendApp(){
		this.sendFile(clientPath+'/main.html')
		this.sent = true
	}

	next()

})

const markAsSent = (req,res,next) => { res.sent = true; next(); }

app.use('/assets', express.static( clientPath ), markAsSent)
app.use('/api', api, markAsSent )



const justSendApp = function(req, res, next){

	res.sent = true
	res.sendFile(clientPath+'/main.html')
	debug('justSendApp')
	next()
}

app.get('/debug', (req,res,next) => {
	res.sent = true
	res.send('ooo')
	throw "XXXXXXXXXXXXXXXx"
	next()


})

app.get('/about', justSendApp )
app.get('/ask', justSendApp )
app.get('/questions', justSendApp )
app.get('/tags', justSendApp )
app.get('/login', justSendApp )
app.get('/oauth-callback-google', (req,res) => {
	res.send(`<html><script>${oauthGoogleJs}</script></html>`)
})
app.get('/t/:tags', (req,res,next) => {

	if ( res.sent ){
		next()
		return
	}

	Tag.findOne( { name: req.params.tag }, (err, doc) => {

		if(err){
			res.status(500)
		}
		else if( doc == null )
			res.status(404)
		else if( doc ){
			res.sendApp()
		}
	})

})
app.get('/q/:question', (req,res,next) => {

	if ( res.sent ){
		next()
		return
	}

	Question.findOne( { id: req.params.question }, {id: 1}, (err, doc) =>{
		if (err){
			res.status(500)
			next()
		}
		else if( doc === null ){
			res.status(404)
			next()
		}
		else {

			res.sendApp()
		}


	})

})


app.use( (err,req,res,next) => {

	debug( err )


	if ( res.sent ){
		next()
		return
	}

	res.status(500).sendApp()
})

app.use( (req,res,next) => {

	if ( res.sent ){
		// next()
		return
	}


	res.status(404).sendApp()
})

app.listen(9090, function () {
  console.log('Server listening on http://localhost:9090')
})
