import React from "react"
import {Link} from 'react-router-dom'




const App = ( props ) =>{

    console.log(props)
    return (
        <div>

        <Header/>
        <div id='content'>
          {props.children}
        </div>

        </div>
)}





export default App
