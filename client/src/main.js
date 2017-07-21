import App from './components/App'
import NotFound from './components/NotFound'
import Tags from './components/Tags'
import {QuestionThread} from './components/Question'
import Questions from './components/Questions'
import Ask from './components/Ask'
import Header from './components/Header'
import Login from './components/Login'
import Profile from './components/Profile'

import React from 'react'
import ReactDOM from 'react-dom'
import {Route, Switch, Link, BrowserRouter} from 'react-router-dom'
import store from './store'

function render(){
    ReactDOM.render((
        <BrowserRouter>
          <Root>
            <Header />
            <div id='content'>
              <Switch>
                <Route exact path="/ask" component={Ask}/>
                <Route exact path="/questions" component={Questions}/>
                <Route exact path="/tags" component={Tags}/>
                <Route exact path="/login" component={Login}/>
                <Route exact path="/profile" component={Profile}/>
                <Route exact path="/q/:question" component={QuestionThread}/>
                <Route component={NotFound}/>
              </Switch>
            </div>
          </Root>
        </BrowserRouter>
    ), document.getElementById('react-outer-root'))
}

class Root extends React.Component{
    render(){
        store.render = () => this.forceUpdate()
        return <div id='root'>{this.props.children}</div>
    }
}

render()
