import React, { Component } from 'react'
// import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { Switch, Route, withRouter, } from 'react-router-dom'

import Menu from "../components/Menu"
import Home from "../components/Home"
import Episodes from "./Episodes"
import Authors from "./Authors"
import AuthorForm from './AuthorForm';
import Categories from './Categories';
import CategoriesForm from './CategoryForm';
import Courses from './Courses';
import CourseEditor from './CourseEditor';
import LessonEditor from './LessonEditor';

class App extends Component {
    render() {
        return <div className="app">
            <div className="left bar-bgcolor">
                <div className="toolbar top-bar-size">
                    <div className="logo-sidebar">
                        <div>Magisteria</div>
                    </div>
                    <Menu/>
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
                            <Route path='/authors/edit/:id' component={AuthorForm}/>
                            <Route path='/authors' component={Authors}/>
                            <Route path='/categories/new' component={CategoriesForm}/>
                            <Route path='/categories/edit/:id' component={CategoriesForm}/>
                            <Route path='/categories' component={Categories}/>
                            <Route path='/courses/new' component={CourseEditor}/>
                            <Route path='/courses/edit/:courseId/lessons/edit/:id' component={LessonEditor}/>
                            <Route path='/courses/edit/:courseId/lessons/new' component={LessonEditor}/>
                            <Route path='/courses/edit/:id' component={CourseEditor}/>
                            <Route path='/courses' component={Courses}/>
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

export default withRouter(connect(mapStateToProps)(App))
