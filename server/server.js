require('dotenv').config({path: '../env'})
const debug = require('debug')('qa')
const mongoose = require('mongoose')
const config = require('./config')
mongoose.connect(config.db, {useMongoClient: true} )
mongoose.Promise = global.Promise
const express = require('express')
const api = require('./api/api')
const path = require('path')
const Tag = require('./models/Tag')
const Question = require('./models/Question')
const clientPath =  path.normalize( __dirname + '/../client/build')
const app = express()



// custom properties
app.use( (req,res,next) => {

	res.sendApp = function sendApp(){
		res.sendFile(clientPath+'/main.html')
	}

	next()

})

app.use('/assets', express.static( clientPath ))
app.use('/api', api)

const justSendApp = function(req, res){
	res.sendFile(clientPath+'/main.html')
	debug('justSendApp')
}

app.get('/debug', (req, res) => {
	res.send('ooo')
	throw 'debug'
})
app.get('/', (req, res) => res.redirect('/questions'))
app.get('/about', justSendApp )
app.get('/ask', justSendApp )
app.get('/questions', justSendApp )
app.get('/tags', justSendApp )
app.get('/login', justSendApp )
app.get('/profile', justSendApp )
app.get('/oauth-callback', (req,res) => {
	res.send(
		`<html><script>
			window.opener.oauthCallback(window.location.hash)
			window.close()
		</script></html>`
	)
})
app.get('/t/:tags', (req, res, next) => {

	Tag.findOne( { name: req.params.tag }, (err, doc) => {

		if(err){
			next(err)
		}
		else if( doc == null )
			return res.status(404).sendApp()
		else if( doc ){
			return res.sendApp()
		}
	})

})
app.get('/q/:question', (req, res, next) => {

	Question.findOne( { id: req.params.question }, {id: 1}, (err, doc) =>{
		if (err){
			next(err)
		}
		else if( doc === null ){
			res.status(404).sendApp()
		}
		else {
			res.sendApp()
		}
	})

})

app.use( (req, res) => {

	debug('404')

	res.status(404).sendApp()
})


app.use( (err, req, res, next) => {

	debug( err )

	res.status(500).sendApp()
})

app.listen(9090, function () {
	console.log('Server listening on http://localhost:9090')
})
