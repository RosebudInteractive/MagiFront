import React from "react";
import {pages} from "../tools/page-tools";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {
    getCourseBookmarks,
    getLessonBookmarks,
    getUserBookmarksFull, loadingSelector
} from "ducks/profile";
import {setCurrentPage} from "../actions/page-header-actions";
import {whoAmI, showSignInForm} from "../actions/user-actions";
// import * as appActions from "../actions/app-actions";
import {refreshState} from "../actions/lesson-info-storage-actions";
import LessonsBlock from '../components/bookmarks/lessons-block'
import CoursesBlock from '../components/bookmarks/courses-block'
import {Redirect} from 'react-router';
import {reset} from "redux-form";
import {showErrorDialog} from "../../src/actions/app-actions";

class BookmarksPage extends React.Component {
    constructor(props) {
        super(props);

        this._redirect = false;

        this.state = {
            courses: true,
            lessons: false
        };
    }

    componentWillMount() {
        this.props.userActions.whoAmI()
        this.props.storageActions.refreshState();
        this.props.getUserBookmarksFull();
        this.props.pageHeaderActions.setCurrentPage(pages.purchases);
        }
    }

    componentWillReceiveProps(nextProps) {
        if ((this.props.loading) && (!nextProps.loading)) {
            if (!nextProps.authorized) {
                this._redirect = true;
                this.forceUpdate();
                if (!this.props.authorized) {
                    this.props.userActions.showSignInForm();
                }
            }
        }

        if (nextProps.isBookmarksPage) {
            if (nextProps.showCourseBookmarks && (nextProps.page !== '/favorites/courses')) {
                this.props.appActions.showCoursesBookmarks();
                this.props.history.replace('/favorites/courses')
            }§

            if (nextProps.showLessonBookmarks && (nextProps.page !== '/favorites/lessons')) {
                this.props.appActions.showLessonsBookmarks();
                this.props.history.replace('/favorites/lessons')
            }
        }
    }

    _openCourses() {
        this.props.appActions.showCoursesBookmarks();
        this.props.history.push('/favorites/courses')
    }

    _openLessons() {
        this.props.appActions.showLessonsBookmarks();
        this.props.history.push('/favorites/lessons')
    }

    render() {
        let {lessonsBookmarks, coursesBookmarks, showLessonBookmarks, showCourseBookmarks} = this.props,
            _lessonsCount = lessonsBookmarks ? lessonsBookmarks.size : 0,
            _coursesCount = coursesBookmarks ? coursesBookmarks.size : 0;

        if (this._redirect) {
            this._redirect = false;
            return <Redirect push to={'/'}/>;
        }

        return (
            <div className="bookmarks-page">
                <div className="profile-block js-tabs">
                    <header className="profile-block__header">
                        <div className="profile-block__header-col">
                            <div className="profile-block__tab-controls">
                                <ul>
                                    <li className="profile-block__tab-control active">
                                        <span className="text">Закладки: </span>
                                    </li>
                                    <li className={"profile-block__tab-control" + (showCourseBookmarks ? " active" : "")}
                                        onClick={::this._openCourses}>
                                        <span className="text">Курсы</span>
                                        <span className="qty">{_coursesCount}</span>
                                    </li>
                                    <li className={"profile-block__tab-control" + (showLessonBookmarks ? " active" : "")}
                                        onClick={::this._openLessons}>
                                        <span className="text">Лекции</span>
                                        <span className="qty">{_lessonsCount}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </header>
                    <div className="profile-block__body">
                        <LessonsBlock active={showLessonBookmarks}/>
                        <CoursesBlock active={showCourseBookmarks}/>
                    </div>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state, ownProps) {
    return {
        lessonsBookmarks: getLessonBookmarks(state),
        coursesBookmarks: getCourseBookmarks(state),
        authorized: !!state.user.user,
        loading: state.user.loading,
        showLessonBookmarks: state.app.showLessonBookmarks,
        showCourseBookmarks: state.app.showCourseBookmarks,
        page: ownProps.location.pathname,
        isBookmarksPage: ownProps.match.path === "/favorites",
    }
}

// function mapDispatchToProps(dispatch) {
//     return {
//         userActions: bindActionCreators(userActions, dispatch),
//         appActions: bindActionCreators(appActions, dispatch),
//         pageHeaderActions: bindActionCreators(pageHeaderActions, dispatch),
//         storageActions: bindActionCreators(storageActions, dispatch),
//         getUserBookmarksFull: bindActionCreators(getUserBookmarksFull, dispatch),
//     }
// }

function mapDispatchToProps(dispatch) {
    return bindActionCreators({closeEditor, insertBook, updateBook, resetReduxForm: reset, showErrorDialog}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(BookmarksPage);