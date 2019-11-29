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
import '../fixed-block.sass'
import '../../course/courses-page.sass'

class Wrapper extends React.Component {

    static propTypes = {
        lesson: PropTypes.object,
        course: PropTypes.object,
        needLockLessonAsPaid: PropTypes.bool,
    }

    render() {
        let {lesson, course,} = this.props,
            _coverPath = '/data/' + getCoverPath(lesson);

        const _categories = lesson.category.map((category) => {
            return category.Name
        }).join(', ');

        const _analytics = {
            Name: course.Name,
            Id: course.Id,
            author: course.AuthorsObj[0].FirstName + " " + course.AuthorsObj[0].LastName,
            category: course.CategoriesObj[0].Name,
            lessonName: lesson.Name,
            price: course.IsPaid ? (course.DPrice && course.Discount ? course.DPrice : course.Price) : 0
        }

        return [
            <div className="course-module _small _fixed course-page__item">
                <div className="course-module__info-block">
                    <div className="course-module__header">
                        <h1 className="course-module__title">
                            <span className={"favourites" + (this._isLessonInBookmarks(lesson.URL) ? ' active' : '')}
                                  onClick={::this._favoritesClick}>В закладки</span>
                            <Link to={'/' + course.URL + '/' + lesson.URL}>
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
                         courseUrl={course.URL} lessonUrl={lesson.URL} isPaidCourse={this.isPaidCourse}
                         isLessonFree={lesson.IsFreeInPaidCourse} needLockLessonAsPaid={this._needLockLessonAsPaid()}
                         analytics={_analytics}/>

        ]
    }

    createMarkup() {
        return {__html: this.props.fixedObjDescr};
    }

    get isPaidCourse() {
        const {course} = this.props;

        return course && course.IsPaid && !course.IsGift && !course.IsBought
    }

    _needLockLessonAsPaid() {
        return this.isPaidCourse && !(this.props.lesson.IsFreeInPaidCourse || this.props.isAdmin)
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
        let {lesson, course} = this.props;

        if (!this.props.authorized) {
            this.props.userActions.showSignInForm();
        } else {
            if (this._isLessonInBookmarks(lesson.URL)) {
                this.props.removeLessonFromBookmarks(course.URL, lesson.URL)
            } else {
                this.props.addLessonToBookmarks(course.URL, lesson.URL)
            }
        }
    }

    _isLessonInBookmarks(lessonUrl) {
        let {course} = this.props;

        return this.props.bookmarks && this.props.bookmarks.find((item) => {
            return item === course.URL + '/' + lessonUrl
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