import React from "react"
import {Link} from "react-router-dom"
import TagLink from './TagLink'


class QuestionThread extends React.Component{

	constructor(){
		super()
		this.state = {data: { question: null, answers: []}}
	}

	componentDidMount(){
		fetch(`/api/question-thread/${this.props.match.params.question}`)
		.then( r => r.json() )
		.then( r => this.setState({data: r}))
		.catch( e => console.error(e))
	}

	upvote(){

		fetch(`/api/cast-vote/${this.props.match.params.question}`, {method: 'post'})
		.then( r => r.json() )
		.then( r => {
			this.state.data.question.votes = r.votes
			this.setState(this.state)
		})
	}

	render(){
		return (
			<div className='question-thread'>
				<Question q={this.state.data.question} upvote={this.upvote.bind(this)} />
				{/* <Answers as={this.state.data.answers} /> */}
				<AnswerForm question={this.props.match.params.question}/>
			</div>
		)
	}
}

function readableTime(date){
	return date.substring(0,10)
}

const Metaline = ({user, date_edit, date_submit, votes}) => (
	<div className='metaline'>

		<div className='author-date'>
			<div>{user}</div>
			<div>{readableTime(date_submit)}</div>
		</div>
	</div>
)

const Question = ({q, upvote}) => q && (
	<div className='question'>
		<div className='title-heading'>
			<div className='votes-group'>
				<div className='votes'>{q.votes}</div>
				<div className='updown'>
					<div onClick={upvote}>↑</div>
					<div>↓</div>
				</div>
			</div>
			<div className='title'>{q.title}</div>
		</div>

		<div className='body'>{q.content}</div>
		<div className='foot'>
			<div className='tagline'>{q.tags.map( x => <TagLink name={x} key={x} /> )}</div>
		</div>
	</div>
)

const Answers = ({as}) => as &&(
	<div className='answers'>
		{as.map( x => <Answer a={x} key={x.id} />)}
	</div>
)

const Answer = ({a}) => a && (
	<div className='answer'>
		<Metaline {...a} />
		<div className='title'>{a.title}</div>
		<div className='body'>{a.content}</div>
		<div className='foot'>
		</div>
	</div>
)


class AnswerForm extends React.Component{

	submit(){
		fetch('/api/submit-answer', {
			method: 'post',
			headers: {'content-type': 'application/json'},
			body: JSON.stringify({
				question: this.props.question,
				text: this.textarea.value,
			})
		})
		.then( r => r.json() )
		.then( r => console.log(r) )
		.catch( e => console.error(e) )
	}

	render(){return(
		<div className='answer-form'>
			<textarea placeholder='Write answer here' ref={t => this.textarea = t} />
			<button onClick={this.submit.bind(this)}>submit</button>
		</div>
	)}
}



export {QuestionThread}
