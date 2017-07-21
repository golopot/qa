import React from "react"
import {Link, withRouter} from 'react-router-dom'


const Header = () => (
  <header id="header">
    <div id='logo'>
      <Link to="/questions"><span>Potato</span></Link>
    </div>

    <div id='board-name'>
      <Link to={getPathTopLevel()}>{getPathTopLevel()}</Link>
    </div>

    <div><SearchBox /></div>
    <div id='head-right'>
      <div><Link to='/ask'>Ask</Link></div>
      <div><Link to='/tags'>Tags</Link></div>
      <div><LoginLink /></div>
      <div></div>
    </div>
  </header>
)


const LoginLink = () => (
	window.localStorage['email']
	? <Link to='/profile'>{window.localStorage['email']}</Link>
	: <Link to='/login'>Login</Link>

)

class SearchBox extends React.Component{

    componentDidMount(){
        this.input.value = this.props.value || ''
    }

    onKeyPress(ev){
        if(ev.key == 'Enter'){
            console.log(this.props)
            this.props.history.push(`/${this.input.value}`)
        }
    }

    render(){return(
        <input
            name='searchbox'
            ref={x=>this.input=x}
            onKeyPress={this.onKeyPress.bind(this)}
        />
    )}
}

SearchBox = withRouter(SearchBox)


function getPathTopLevel(){
    var d = document.location.pathname.split('/')
    return d.length > 1 ? `/${d[1]}` : '/'
}



export default Header
