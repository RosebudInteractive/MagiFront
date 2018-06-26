import React from "react";
import {pages} from "../tools/page-tools";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {
    // addCourseToBookmarks,
    getCourseBookmarks,
    getLessonBookmarks,
    getUserBookmarksFull
    // removeCourseFromBookmarks
} from "../ducks/profile";
import * as pageHeaderActions from "../actions/page-header-actions";
import * as userActions from "../actions/user-actions";
import * as storageActions from "../actions/lesson-info-storage-actions";
import LessonsBlock from '../components/bookmarks/lessons-block'
import CoursesBlock from '../components/bookmarks/courses-block'

class BookmarksPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            courses: true,
            lessons: false
        };
    }

    componentWillMount() {
        this.props.userActions.whoAmI()
        this.props.storageActions.refreshState();
        this.props.getUserBookmarksFull();
        this.props.pageHeaderActions.setCurrentPage(pages.author);
    }

    _openCourses() {
        this.setState({
            courses: true,
            lessons: false,
        })
    }

    _openLessons() {
        this.setState({
            courses: false,
            lessons: true,
        })
    }

    render() {
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
                                    <li className={"profile-block__tab-control" + (this.state.courses ? " active" : "")}
                                        onClick={::this._openCourses}>
                                        <span className="text">Курсы</span>
                                    </li>
                                    <li className={"profile-block__tab-control" + (this.state.lessons ? " active" : "")}
                                        onClick={::this._openLessons}>
                                        <span className="text">Лекции</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </header>
                    <div className="profile-block__body">
                        <LessonsBlock active={this.state.lessons}/>
                        <CoursesBlock active={this.state.courses}/>
                    </div>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        lessonsBookmarks: getLessonBookmarks(state),
        coursesBookmarks: getCourseBookmarks(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        userActions: bindActionCreators(userActions, dispatch),
        pageHeaderActions: bindActionCreators(pageHeaderActions, dispatch),
        storageActions: bindActionCreators(storageActions, dispatch),
        getUserBookmarksFull: bindActionCreators(getUserBookmarksFull, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(BookmarksPage);