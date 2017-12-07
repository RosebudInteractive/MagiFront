import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { Switch, Route, withRouter, } from 'react-router-dom'

import Menu from "../components/Menu"
import Home from "../components/Home"
import Episodes from "./Episodes"
import Authors from "./Authors"
import AuthorForm from './../components/AuthorForm';

import * as pageActions from '../actions/PageActions'
import * as menuActions from "../actions/MenuActions"

class App extends Component {
    render() {
        const {menu} = this.props;
        // const {getPhotos} = this.props.pageActions;
        const {setSelected} = this.props.menuActions;

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
                            <Route path="/episodes" component={Episodes}/>
                            <Route path='/authors/new' component={AuthorForm}/>
                            <Route path='/authors/edit' component={AuthorForm}/>
                            <Route path='/authors' component={Authors}/>
                        </Switch>
                    </div>
                </div>
            </div>
        </div>
    }
}

function mapStateToProps(state, ownProps) {
    return {
        user: state.user,
        page: state.page,
        menu: state.menu,
        ownProps,
    }
}
function mapDispatchToProps(dispatch) {
    return {
        pageActions: bindActionCreators(pageActions, dispatch),
        menuActions: bindActionCreators(menuActions, dispatch)
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App))
