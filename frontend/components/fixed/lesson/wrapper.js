import React from 'react'
import {connect} from 'react-redux';
import PlayerBlock from "../poster";
import {getCoverPath} from "../../../tools/page-tools";
import PropTypes from 'prop-types'
import {Link} from "react-router-dom";
import {fixedObjDescrSelector} from '../../../ducks/params'
import {addLessonToBookmarks, getUserBookmarks, removeLessonFromBookmarks, userBookmarksSelector} from "ducks/profile";
import {bindActionCreators} from "redux";
import * as userActions from "actions/user-actions";

class Wrapper extends React.Component {

    static propTypes = {
        lesson: PropTypes.object,
        courseUrl: PropTypes.string,
        isPaidCourse: PropTypes.bool,
        needLockLessonAsPaid: PropTypes.bool,
    }

    render() {
        let {lesson, courseUrl, isPaidCourse} = this.props,
            _coverPath = '/data/' + getCoverPath(lesson);


        const _categories = lesson.category.map((category) => {
            return category.Name
        }).join(', ');

        return [
            <div className="course-module _small">
                <div className="course-module__info-block">
                    <div className="course-module__header">
                        <h1 className="course-module__title">
                            <span className={"favourites" + (this._isLessonInBookmarks(lesson.URL) ? ' active' : '')}
                                  onClick={::this._favoritesClick}>В закладки</span>
                            <Link to={'/' + courseUrl + '/' + lesson.URL}>
                                <p className="course-module__label">Лекция:</p> <span>{lesson.Name}</span>
                            </Link>
                        </h1>
                        <div className="course-module__info">
                            <div className="course-module__stats">
                                <b className="category">{_categories}</b>
                                {" / "}
                                <span className="author-name">{this._getAuthor()}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="course-module__description-block">
                    <p dangerouslySetInnerHTML={this.createMarkup()}/>
                </div>
            </div>,
            <PlayerBlock poster={_coverPath} visibleButton={true} lessonId={lesson.Id} audios={lesson.Audios}
                         courseUrl={courseUrl} lessonUrl={lesson.URL} isPaidCourse={isPaidCourse}
                         isLessonFree={lesson.IsFreeInPaidCourse} needLockLessonAsPaid={this._needLockLessonAsPaid()}/>

        ]
    }

    createMarkup() {
        return {__html: this.props.fixedObjDescr};
    }

    _needLockLessonAsPaid() {
        return this.props.isPaidCourse && !(this.props.lesson.IsFreeInPaidCourse || this.props.isAdmin)
    }

    _getAuthor() {
        let {lesson} = this.props;
        let _author = (lesson && lesson.author) ? lesson.author : null

        if (_author) {
            let _name = _author.FirstName + ' ' + _author.LastName
            return <Link to={'/autor/' + _author.URL}>{_name}</Link>
        } else {
            return null
        }
    }

    _favoritesClick() {
        let {lesson, courseUrl} = this.props;

        if (!this.props.authorized) {
            this.props.userActions.showSignInForm();
        } else {
            if (this._isLessonInBookmarks(lesson.URL)) {
                this.props.removeLessonFromBookmarks(courseUrl, lesson.URL)
            } else {
                this.props.addLessonToBookmarks(courseUrl, lesson.URL)
            }
        }
    }

    _isLessonInBookmarks(lessonUrl) {
        let {courseUrl} = this.props;

        return this.props.bookmarks && this.props.bookmarks.find((item) => {
            return item === courseUrl + '/' + lessonUrl
        })
    }
}

function mapStateToProps(state) {
    return {
        fixedObjDescr: fixedObjDescrSelector(state),
        bookmarks: userBookmarksSelector(state),
        authorized: !!state.user.user,
        isAdmin: !!state.user.user && state.user.user.isAdmin,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        getUserBookmarks: bindActionCreators(getUserBookmarks, dispatch),
        addLessonToBookmarks: bindActionCreators(addLessonToBookmarks, dispatch),
        removeLessonFromBookmarks: bindActionCreators(removeLessonFromBookmarks, dispatch),
        userActions: bindActionCreators(userActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Wrapper);