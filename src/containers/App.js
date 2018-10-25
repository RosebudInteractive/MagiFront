import React, {Component} from 'react'
import {connect} from 'react-redux'

import {Switch, Route, withRouter, Link,} from 'react-router-dom'

import Menu from "../components/Menu"
import Home from "../components/Home"
import Authors from "./Authors"
import AuthorForm from './authorEditor';
import Categories from './Categories';
import CategoriesForm from './categoryEditor';
import Courses from './Courses';
import CourseEditor from './course-editor';
import LessonEditor from './lesson-editor';
import SubLessonEditor from './subLesson-editor';
import EpisodeEditor from './episode-editor';
import WorkShop from './work-shop';
import SignInForm from './sign-in-form';

import {userAuthSelector, whoAmI} from "../ducks/auth";
import {bindActionCreators} from "redux";

class App extends Component {

    componentWillMount() {
        this.props.whoAmI();
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.location.pathname !== nextProps.location.pathname) {
            this.props.whoAmI();
        }
    }

    render() {
        let {workShopVisible, isUserAuthorized} = this.props,
            _homePath = '/adm',
            _isNeedHideAdm = workShopVisible || !isUserAuthorized;

        const _hideStyle = {display: 'none'};

        return [<WorkShop/>,
            !isUserAuthorized ? <SignInForm/> : null,
            isUserAuthorized ?
                <div className="app" style={_isNeedHideAdm ? _hideStyle : null}>
                    <div className="left bar-bgcolor">
                        <div className="toolbar top-bar-size">
                            <Link to={'/'}>
                                <div className="logo-sidebar">
                                    <div>Magisteria</div>
                                </div>
                            </Link>
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
                                    <Route exact path={_homePath} component={Home}/>
                                    <Route path={_homePath + '/authors/new'} component={AuthorForm}/>
                                    <Route path={_homePath + '/authors/edit/:id'} component={AuthorForm}/>
                                    <Route path={_homePath + '/authors'} component={Authors}/>
                                    <Route path={_homePath + '/categories/new'} component={CategoriesForm}/>
                                    <Route path={_homePath + '/categories/edit/:id'} component={CategoriesForm}/>
                                    <Route path={_homePath + '/categories'} component={Categories}/>
                                    <Route path={_homePath + '/courses/new'} component={CourseEditor}/>
                                    <Route
                                        path={_homePath + '/courses/edit/:courseId/lessons/edit/:lessonId/episodes/edit/:id'}
                                        component={EpisodeEditor}/>
                                    <Route
                                        path={_homePath + '/courses/edit/:courseId/lessons/edit/:lessonId/episodes/new'}
                                        render={(props) => (
                                            <EpisodeEditor {...props} isSupp={false}/>
                                        )}/>
                                    <Route
                                        path={_homePath + '/courses/edit/:courseId/lessons/edit/:lessonId/sub-lessons/edit/:subLessonId/episodes/edit/:id'}
                                        component={EpisodeEditor}/>
                                    <Route
                                        path={_homePath + '/courses/edit/:courseId/lessons/edit/:lessonId/sub-lessons/edit/:subLessonId/episodes/new'}
                                        render={(props) => (
                                            <EpisodeEditor {...props} isSupp={false}/>
                                        )}/>
                                    <Route
                                        path={_homePath + '/courses/edit/:courseId/lessons/edit/:lessonId/supp-episodes/new'}
                                        render={(props) => (
                                            <EpisodeEditor {...props} isSupp={true}/>
                                        )}/>
                                    <Route
                                        path={_homePath + '/courses/edit/:courseId/lessons/edit/:id/sub-lessons/edit/:subLessonId'}
                                        component={SubLessonEditor}/>
                                    <Route path={_homePath + '/courses/edit/:courseId/lessons/edit/:id/sub-lessons/new'}
                                           component={SubLessonEditor}/>
                                    <Route path={_homePath + '/courses/edit/:courseId/lessons/edit/:id'}
                                           component={LessonEditor}/>
                                    <Route path={_homePath + '/courses/edit/:courseId/lessons/new'}
                                           component={LessonEditor}/>
                                    <Route path={_homePath + '/courses/edit/:id'} component={CourseEditor}/>
                                    <Route path={_homePath + '/courses'} component={Courses}/>
                                </Switch>
                            </div>
                        </div>
                    </div>
                </div>
                :
                null,
        ]
    }
}

function mapStateToProps(state, ownProps) {
    return {
        user: state.user,
        page: state.page,
        menu: state.menu,
        workShopVisible: state.workShop.visible,
        isUserAuthorized: userAuthSelector(state),
        ownProps,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        whoAmI: bindActionCreators(whoAmI, dispatch),
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App))
