import React from 'react'
import {Link} from 'react-router-dom'


function onLogout(){
	window.localStorage.removeItem('name')
	window.localStorage.removeItem('email')
	location.href = '/' 
}
export default () => (
	<div><button onClick={onLogout}>logout</button></div>
)
