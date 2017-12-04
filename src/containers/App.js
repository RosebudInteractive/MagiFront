import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { Switch, Route } from 'react-router-dom'

import User from '../components/User'
import Page from '../components/Page'
import Menu from "../components/Menu"
import Home from "../components/Home"
import Episodes from "./Episodes"

import * as pageActions from '../actions/PageActions'
import * as menuActions from "../actions/MenuActions"

class App extends Component {
    render() {
        const { user, page, menu } = this.props
        const { getPhotos } = this.props.pageActions
        const { setSelected } = this.props.menuActions
        return <div className="app">
            <div className="left bar-bgcolor">
                <div className="toolbar top-bar-size">
                    <div className="logo-sidebar">
                        <div>Magisteria</div>
                    </div>
                    <Menu items={menu.items} selected={menu.selected} setSelected={setSelected}/>
                </div>
            </div>
            <div className="right">
                <div className="right-container">
                    <div className="right-top top-bar-size">
                        <div className="toolbar top-bar-size bar-bgcolor">
                        </div>
                    </div>
                    <div className="main-area">
                        <Switch>
                            <Route exact path='/' component={Home}/>
                            <Route path='/photos' render={() => {
                                <div>
                                    <Page photos={page.photos} year={page.year} getPhotos={getPhotos} fetching={page.fetching}/>
                                    < User name={user.name} />
                                </div>
                            }}/>
                            <Route path="/episodes" render={() => {
                                <div className="page">
                                    <Episodes/>
                                </div>
                            }}/>
                        </Switch>
                    </div>
                </div>
            </div>
        </div>
    }
}

function mapStateToProps(state) {
    return {
        user: state.user,
        page: state.page,
        menu: state.menu
    }
}
function mapDispatchToProps(dispatch) {
    return {
        pageActions: bindActionCreators(pageActions, dispatch),
        menuActions: bindActionCreators(menuActions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
