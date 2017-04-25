const express = require('express')
const Tag = require('./../models/Tag')
const User = require('./../models/User')
const Question = require('./../models/Question')
const Answer = require('./../models/Answer')
const mongoose = require('mongoose')
const debug = require('debug')('qa')
const pnr = s => {debug(s); return s;}
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

router.get('/', (req,res) => {
	res.json('eee')
})


router.get('/tags', (req,res) => {

	Tag.find({}, (err,data)=>{
		res.json(data)
	})

})


router.post('/delete_post/:question', (req,res) => {

	Question.findOne({id: req.params.question}, {id: true, tag: true})
	.then( doc => QuestionIndexUtils.deleteQuestion( doc.id, doc.tag) )
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


router.post('/cast_vote/:question', (req,res,next) => {


	var questionId = req.params.question

	Question.voteUp( questionId )
	.then( () => QuestionIndexUtils.updateVotes( questionId ) )
	.catch( e => {
		if ( e == 'ARTICLE_NOT_FOUND' )
			res.status(400).send(e)
		else if ( e == 'ARTICLE_NOT_FOUND_IN_INDEX')
			res.status(400).send(e)
		else if ( e == 'VOTE_TWICE')
			res.status(400).send(e)
		else{
			next(e)
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
	.catch( (e) => {res.status(400).end();console.error(e)})

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
	.catch( e => console.error(e) )
})


router.get('/question/:id', (req,res) => {
	Question.findOne({id: req.params.id}).exec().then( r => {
		res.json( r )
	})
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
		if(e == 'doc is null') res.status(404).send('')
		else {res.status(500).send(''); debug(e);}
	})
})


router.post('/signin-oauth', (req,res,next) => {
	var {access_token} = qs.parse(req.body.hash.substring(1))
	if( !access_token ){res.status(400).send('')}

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
		.then( r => r.gid )

	const createUser = (gid) => {
		return User.fancyInsert(new User({gid}))
		.then( id => User.collection.findOne({id}) )
	}

	const findOrCreateUser = (gid) =>
		User.collection.findOne({gid})
		.then( x => x === null ? createUser(gid) : x )

	const sendToken = (user) => {
		const id = user.id
		const pre = `${id}.${Date.now()}`
		const hash = crypto.createHmac('sha256', appsecret).update(pre).digest('hex')
		const token = `${pre}.${hash}`
		res.json({token})
	}

	checkClientIdMatch()
	.then(getUserInfo)
	.then(findOrCreateUser)
	.then(sendToken)
	.catch( e => { console.error(e); res.status(500).send('')} )

})

router.use( (err,req,res,next) => {

	console.log( err )
	res.status(500).send( JSON.stringify('500 server error.\n'))
})

router.use( (req,res) => {

	res.status(404).send('404 not found\n')
})

module.exports = router
