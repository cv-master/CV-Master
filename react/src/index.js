import 'bootstrap/dist/css/bootstrap.css'
import React from 'react'
import ReactDOM from 'react-dom'
import { Router, Route, Switch } from 'react-router-dom'
import { Provider } from 'react-redux'
import history from './history'
import './index.css'
import App from './components/App'
import Home from './components/Home'
import NotFound from './components/NotFound'
import store from './store'

// 404 page not yet working for invalid uid or cvid
ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <Switch>
        <Route exact path="/users/:uid" component={App} />
        <Route exact path="/users/:uid/:cvid" component={App} />
        <Route exact path="/users" component={Home} />
        <Route exact path="/" component={Home} />
        <Route path="*" component={NotFound} />
      </Switch>
    </Router>
  </Provider>,
  document.getElementById('root'),
)
