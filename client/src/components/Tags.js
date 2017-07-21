import React from "react"
import {Link} from "react-router-dom"
import TagLink from './TagLink'

class TagList extends React.Component{

    componentDidMount(){

        fetch ('/api/tags', {method: 'get'})
        .then( r => r.json())
        .then( r => { this.setState({data: r}) })
        .catch( r => console.error(r) )

    }


    render(){
		const list = this.state 
			&& this.state.data
			&& this.state.data.length > 0
			&& this.state.data
                .map( (x, i) => <TagItem key={i} name={x.name} count={x.count} /> )
			|| null


        return(
          <div>
              <div>
                <div><span>Find topics:</span><input /></div>
              </div>


              <div id='tag-list'>
                {list}
              </div>

          </div>
        )
    }

}



const TagItem = ({name, count}) => (
    <div><TagLink name={name}/> <span>{count}</span></div>

)


export default TagList
