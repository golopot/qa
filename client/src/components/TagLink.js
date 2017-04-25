import React from "react"
import {Link} from "react-router-dom"
import store from '../store'

const TagLink = ({name}) => (
    <Link to={'/questions?tags='+name} className='tag' onClick={store.render}>{name}</Link>
)

export default TagLink
