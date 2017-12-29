import React, { Component } from 'react'
import { connect } from 'react-redux'

import { Switch, Route, withRouter, } from 'react-router-dom'

import Menu from "../components/Menu"
import Home from "../components/Home"
import Episodes from "./Episodes"
import Authors from "./Authors"
import AuthorForm from './authorEditor';
import Categories from './Categories';
import CategoriesForm from './categoryEditor';
import Courses from './Courses';
import CourseEditor from './courseEditor';
import LessonEditor from './lessonEditor';
import SubLessonEditor from './subLessonEditor';
import EpisodeEditor from './episodeEditor';

class App extends Component {
    render() {
        return <div className="app">
            <div className="left bar-bgcolor">
                <div className="toolbar top-bar-size">
                    <div className="logo-sidebar">
                        <div>Magisteria</div>
                    </div>
                    <Menu history={this.props.history}/>
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
                            <Route path='/courses/edit/:courseId/lessons/edit/:lessonId/episodes/edit/:id'
                                   component={EpisodeEditor}/>
                            <Route path='/courses/edit/:courseId/lessons/edit/:lessonId/episodes/new'
                                   render={(props) => (
                                       <EpisodeEditor {...props} isSupp={false} />
                                   )}/>
                            <Route path='/courses/edit/:courseId/lessons/edit/:lessonId/sub-lessons/edit/:subLessonId/episodes/edit/:id'
                                   component={EpisodeEditor}/>
                            <Route path='/courses/edit/:courseId/lessons/edit/:lessonId/sub-lessons/edit/:subLessonId/episodes/new'
                                   render={(props) => (
                                       <EpisodeEditor {...props} isSupp={false} />
                                   )}/>
                            <Route path='/courses/edit/:courseId/lessons/edit/:lessonId/supp-episodes/new'
                                   render={(props) => (
                                       <EpisodeEditor {...props} isSupp={true} />
                                   )}/>
                            <Route path='/courses/edit/:courseId/lessons/edit/:id/sub-lessons/edit/:subLessonId' component={SubLessonEditor}/>
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
