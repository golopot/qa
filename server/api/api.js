const express = require('express')
const Tag = require('./../models/Tag')
const User = require('./../models/User')
const Question = require('./../models/Question')
const Answer = require('./../models/Answer')
// const mongoose = require('mongoose')
const debug = require('debug')('qa')
const pnr = s => {debug(s); return s}
const bodyParser = require('body-parser')
const router = express.Router()
const fetch = require('node-fetch')
const qs = require('qs')
const crypto = require('crypto')
const appsecret = process.env.appsecret

const ko = obj => {
	for(var field in obj){
		for(var op in obj[field]){
			if(obj[field][op] === null){
				delete obj[field][op]
			}
		}
		if( Object.keys(obj[field]).length === 0 && obj.constructor === Object ){
			delete obj[field]
		}
	}
	return obj
}


router.use( bodyParser.json() )



router.use( (req, res, next) => {
	res.E400 = e => {
		res.status(400).json({
			error:{
				status: '400',
				title: e || 'Bad request'
			}
		})
		console.log(e)
	}

	res.E404 = e => {
		res.status(404).json({
			error:{
				status: '400',
				title: e || 'Not found'
			}
		})
		console.log(e)
	}

	res.E500 = e => {
		res.status(500).json({
			error:{
				status: '500',
				title: e || 'Server error'
			}
		})
		console.log(e)
	}

	next()
})

router.get('/', (req,res) => {
	res.json('eee')
})


router.get('/tags', (req,res) => {

	Tag.collection.find({}).sort({count: -1}).toArray()
	.then( docs => res.json(docs))
	.catch( e => res.E500(e) )

})

router.post('/delete_post/:question', (req,res) => {

	Question.findOne({id: req.params.question}, {id: true, tag: true})
		.then( () => Question.remove({id: req.params.id}) )
		.catch( e => {res.status(400).end(); console.log(e)} )

})


router.get('/question-list', (req,res) => {

	debug(req.query)
	const q = req.query
	const tags = q.tags ? (q.tags.split(' ')||null) : null
	const after = q.after || null
	const sortBy = q.sort || null
	const minvotes = q.minvotes || null
	const size = 30

	Question.collection.find(ko({
		submit_date: {$gt: after},
		votes: {$gt: minvotes},
		tags: {$all: tags}
	}))
	.sort({[sortBy]: -1})
	.limit(size)
	.toArray()
	// .then( r => pnr(r) )
	.then( r => res.json(r) )
	.catch( e => console.error(e) )

})


router.post('/cast-vote/:question', (req,res,next) => {


	var questionId = req.params.question

	Question.voteUp( questionId )
	.then( votes => res.json({votes}))
	.catch( e => {
		if ( e === 'ARTICLE_NOT_FOUND' || e === 'VOTE_TWICE' )
			res.E400(e)
		else{
			res.E500(e)
		}
	})
})


router.post('/submit-question', (req,res) => {

	debug(req.body)
	var b = req.body
	if(b.tags && b.tags.length > 6){
		res.status(400).send('TOO_MUCH_TOPICS')
		return
	}

	var question = new Question({
		version: 0,
		title: b.title,
		user: b.user,
		content: b.content,
		tags: b.tags,
		type: b.type,
		date_submit: new Date(),
		date_edit: new Date(),
		votes: 0,
		vote_up_users: [],
		vote_down_users: [],
		comments: []
	})


	Question.fancyInsert(question)
	.then( () => Promise.all( question.tags.map( t => Tag.updateCount(t) ) ) )
	.then( () => {res.json('success')} )
	.catch( e => res.E500(e) )

})

router.post('/submit-answer', (req,res) => {

	debug(req.body)
	var b = req.body

	var answer = new Answer({
		version: 0,
		user: 'userfooo',
		content: b.text,
		question: ~~b.question,
		date_submit: new Date(),
		votes: 0,
	})

	Answer.fancyInsert(answer)
	.then( answerId => Question.collection.update(
		{id: ~~b.question}, {$push: {answers: answerId} } ) )
	.then( () => {res.json('sucess')} )
	.catch( e => res.E500(e) )
})


router.get('/question/:id', (req,res) => {
	Question.findOne({id: req.params.id}).exec().then( r => {
		res.json( r )
	})
	.catch( e => res.E500(e))
})


router.get('/question-thread/:id', (req,res) => {
	Question.collection.findOne({id: ~~req.params.id})
	.then( doc => (doc === null) ? Promise.reject('doc is null') : doc )
	.then( doc => Promise.all(
		[doc, Answer.collection.find({id: {$in: doc.answers || [] }}).toArray()]
	))
	.then( ([q, as]) => {
		res.json( {question: q, answers: as})
	})
	.catch( e => {
		if(e == 'doc is null') res.E404('Question not found')
		else res.E500(e)
	})
})


router.post('/signin-oauth', (req,res,next) => {
	var {access_token} = qs.parse(req.body.hash.substring(1))
	if (!access_token) res.E400('')

	const checkClientIdMatch = () =>
		fetch(
			'https://www.googleapis.com/oauth2/v3/tokeninfo?' + qs.stringify({access_token}),
			{method: 'post'}
		)
		.then( r => r.json())
		.then( r => pnr(r))
		.then( r => {
			if(r.aud !== '806708806553-ausj6asg5gof7tnfg2c20jjv32cm8jf6.apps.googleusercontent.com'){
				throw('client_id mismatch')
			}
		})


	const getUserInfo = () =>
		fetch('https://www.googleapis.com/userinfo/v2/me' ,{
			method: 'get',
			headers: {Authorization: `Bearer ${access_token}`}
		})
			.then( r => r.json())
			.then( r => {
				if( r.verified_email !== true ) throw('google email is not verified')
				return r
			})

	const createUser = (info) =>
		User.fancyInsert(new User({
			gid: info.id,
			name: 'unnamed',
			email: info.email,
		}))
			.then( id => User.collection.findOne({id}) )

	const findOrCreateUser = (info) =>
		User.collection.findOne({gid: info.id})
			.then( x => x || createUser(info) )

	const sendToken = (user) => {
		const id = user.id
		const pre = `${id}.${Date.now()}`
		const hash = crypto.createHmac('sha256', appsecret).update(pre).digest('hex')
		const token = `${pre}.${hash}`
		res.json({token, uname:user.name, email:user.email})
	}


	checkClientIdMatch()
	.then(getUserInfo)
	.then(findOrCreateUser)
	.then(sendToken)
	.catch( e => res.E500(e) )

})

router.use( (req, res) => {
	res.E404()
})

router.use( (err, req, res, next) => {
	res.E500()
})


module.exports = router
