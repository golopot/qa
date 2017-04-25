import React from "react"
import {Link} from "react-router-dom"


class Ask extends React.Component{

    componentDidMount(){

    }

    onSubmit(){
        console.log(this)
        var title = this.form.querySelector('input').value
        var tags = this.form.querySelector('.askform-tags').value.trim().split(' ')
        var content = this.form.querySelector('textarea').value
        var user = 'foouser'

        console.log({title, tags, content})
        fetch('/api/submit-question', {
            method: 'post',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify({
                title,
                content,
                tags,
                user,
            })
        })
        .then( r => console.log( r.text() ) )
    }

    render(){

        return(
          <div className='ask-form' ref={x => {this.form = x}}>
              <div><input placeholder='Title' /></div>
              <div><textarea placeholder='Content' /></div>
              <div><input placeholder='Tags' className='askform-tags' /></div>
              <button onClick={this.onSubmit.bind(this)}>Submit</button>
          </div>
        )
    }

}



export default Ask
