import React, {Component} from 'react'
import {connect} from 'react-redux'

import {Switch, Route, withRouter, Link,} from 'react-router-dom'

import Menu from "../components/menu"
import Home from "../components/Home"
import Authors from "./Authors"
import AuthorForm from './authorEditor';
import Categories from './Categories';
import CategoriesForm from './categoryEditor';
import Courses from './Courses';
import CourseEditor from './course-editor-new';
import LessonEditor from './lesson-editor-new';
import SubLessonEditor from './subLesson-editor';
import EpisodeEditor from './episode-editor';
import BooksPage from './books-list-page';
import WorkShop from './work-shop';
import SignInForm from './sign-in-form';

import {userAuthSelector, whoAmI} from "../ducks/auth";
import {getAppOptions,} from "../ducks/app";
import {bindActionCreators} from "redux";
import Toolbar from "../components/app/toolbar";
import * as appActions from '../actions/app-actions'
import './app.sass'

class App extends Component {

    componentWillMount() {
        this.props.getAppOptions()
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
                <div className="app adm" style={_isNeedHideAdm ? _hideStyle : null}>
                    <div className="left bar-bgcolor">
                        <div className="toolbar top-bar-size">
                            <Link to={'/'}>
                                <div className="logo-sidebar">
                                    <div>Magisteria</div>
                                </div>
                            </Link>
                            <Menu history={this.props.history} location={this.props.location}/>
                        </div>
                    </div>
                    <Toolbar/>
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
                            <Route path={_homePath + '/books/new'} render={(props) => <BooksPage {...props} showEditor={true} editMode={false}/>}/>
                            <Route path={_homePath + '/books/edit/:id'} render={(props) => <BooksPage {...props} showEditor={true} editMode={true}/>}/>
                            <Route path={_homePath + '/books'} component={BooksPage}/>
                        </Switch>
                    </div>
                </div>
                :
                null,
        ]
    }
}

{/**/}

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
        getAppOptions: bindActionCreators(getAppOptions, dispatch),
        appActions: bindActionCreators(appActions, dispatch),
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App))
