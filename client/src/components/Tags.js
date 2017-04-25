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
        if ( this.state && this.state.data && this.state.data.length > 0 )
            var list = this.state.data
                .map( (x,i) => <TagItem key={i} name={x.name}/> )
        else
            var list = null


        return(
          <div>
              <div>
                <div><span>Find topics:</span><input /></div>
              </div>


              <div id='tags-list'>
                {list}
              </div>

          </div>
        )
    }

}



const TagItem = ({name}) => (
    <div><TagLink name={name}/></div>

)


export default TagList
