import React from 'react'
import {Link} from 'react-router-dom'
import TagLink from './TagLink'
import qs from 'qs'
import config from '../config'

function oauthCallback(hash){

	fetch('/api/signin-oauth',{
		method: 'post',
		headers: {'content-type': 'application/json'},
		body: JSON.stringify({hash}),
	})
	.then( r => r.json())
	.then( r => {
		document.cookie = `authtoken=${r.token};SameSite=Strict`
		// Max-Age=31536000
		window.localStorage['user'] = r.uname
		window.localStorage['email'] = r.email 
		window.location.href = '/'

	})
	.catch( e => console.error(e) )
}

class Login extends React.Component{

	constructor(){
		super()
		this.state = {}
	}

    onClick(){
		window.oauthCallback = oauthCallback
        var params = {
            client_id: '806708806553-ausj6asg5gof7tnfg2c20jjv32cm8jf6.apps.googleusercontent.com',
            redirect_uri: `http://${location.host}/oauth-callback`,
            response_type: 'token',
            scope: 'https://www.googleapis.com/auth/userinfo.email',
            include_granted_scopes: 'true',
            state: 'foo=bar',
        }

		var newWindow = window.open(
			'https://accounts.google.com/o/oauth2/v2/auth?'+qs.stringify(params),
			null,
			`width=525,height=725,left=${screenX+40},top=${screenY+40}`
		)

    }

	render(){return (
		<div>
            <button onClick={this.onClick}>Sign in with Google</button>
		</div>
	)}
}




export default Login
