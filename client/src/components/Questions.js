import React from "react"
import {Link} from "react-router-dom"
import qs from 'qs'
import TagLink from './TagLink'


// class QuestionSource{
//
//     constructor(){
//         this.uri = ''
//         this.callback = () => {}
//     }
//
//     subscribe(f){
//         this.callback = f
//     }
//
//     unsubscribe(){
//         this.callback = () => {}
//     }
//
//     fetch(){
//         fetch(uri)
//         .then( r => this.callback(r))
//         .catch( e => console.error(e))
//     }
// }
//
// const questionSource = new QuestionSource()

class Questions extends React.Component{

    constructor(props){
        super(props)
        this.state = {
            query: qs.parse(props.location.search),
            querySent: '',

        }
    }

    componentDidMount(){
        this.fetchThings(this.props.location.search)
    }

    componentWillReceiveProps(nextProps){
        this.fetchThings(nextProps.location.search)
    }

    fetchThings(query){
        return fetch(`/api/question-list` + query)
            .then( r => r.json() )
            .then( r => { this.setState( { data: r } ) })
            .catch( e => console.error(e))
    }

    render(){
        return (
            <div>
                <QuestionListHead/>
                <QuestionListBody list={this.state.data} />
            </div>
        )

    }
}




const QuestionListBody = ({list}) => {

    if ( !list || !list.length > 0)
        return null

    return(
        <div id='article-list'>
          { list.map( x => <QuestionItem things={x} key={x.id} /> ) }
        </div>
    )
}


const QuestionListHead = () => (

    <div id='article-list-header'></div>

)

const Tagline = ({tags}) => (

    <div className='tagline'>
      {tags.map( tag => <TagLink name={tag} key={tag} /> )}
    </div>
)



class QuestionItem extends React.Component{

    constructor(props){
        super(props)
        this.state = {}
    }

    voteUp(){
        this.setState({votes: this.state.votes+1})
    }

    onClick(ev){
        if( ev.target.classList.contains('li-vote') ){

            ev.preventDefault()
            var id = ev.target.dataset.articleId
            fetch(`/api/cast_vote/${id}`, {method: 'POST'})
            .then( x => x.text() )
            .then( x => console.log(x) )
            .then( this.voteUp() )
        }

    }

    render(){

        var {title, id, votes, comments_length, date_submit, user, tags} = this.props.things

        return(

          <div className='question-item' onClick={this.onClick}>
            <div className='left'>
              <div><div>{votes}</div></div>
              <div><div>0</div></div>
            </div>
            <div className='right'>
              <div className='title'>
                <Link to={'/q/'+id}>{title}</Link>
              </div>
              <div className='subtitle'>
                <Tagline tags={tags||[]}/>
                <span>by {user} {date_submit.substring(5,10)}</span>
              </div>
            </div>
          </div>
        )
    }

}


export default Questions
