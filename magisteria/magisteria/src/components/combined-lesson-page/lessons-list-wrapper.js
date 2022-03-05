import React from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';
import PlayBlock from './play-block'
import SubLessonPlayBlock from './subLesson-play-block'

import * as lessonActions from '../../actions/lesson-actions';
import {ImageSize, getCoverPath, OverflowHandler} from '../../tools/page-tools'
import $ from 'jquery'
import {userPaidCoursesSelector} from "ducks/profile";
import {notifyLessonLinkClicked} from "ducks/google-analytics";

class LessonsListWrapper extends React.Component {
    static propTypes = {
        isDark: PropTypes.bool,
    };

    constructor(props) {
        super(props);
    }

    _getLessonsList() {
        const {object: lessons, authors} = this.props.lessons;
        const {course, userPaidCourses} = this.props;
        let _needShowAuthor = (authors && (authors.length > 1)),
            _isPaidCourse = (course.IsPaid && !course.IsGift && !course.IsBought && !userPaidCourses.includes(course.Id))

        return lessons.map((lesson, index) => {
            lesson.Author = authors.find((author) => {
                return author.Id === lesson.AuthorId
            });

            lesson.Lessons.forEach((subLesson) => {
                subLesson.Author = authors.find((author) => {
                    return author.Id === subLesson.AuthorId
                });
            })

            return <ListItem {...this.props} lesson={lesson} course={course} showAuthor={_needShowAuthor} key={index} isPaidCourse={_isPaidCourse}
                             onLinkClick={this.props.notifyLessonLinkClicked}/>
        });
    }

    UNSAFE_componentWillReceiveProps(nextProps){
        if ((!this.props.isLessonMenuOpened) && (nextProps.isLessonMenuOpened)) {
            OverflowHandler.rememberScrollPos()
        }
    }

    componentDidUpdate(prevProps) {
        if ((!prevProps.isLessonMenuOpened) && (this.props.isLessonMenuOpened)) {
            OverflowHandler.turnOn()

            let _control = $("#lesson-" + this.props.active);
            if (_control.length > 0) {
                let _list = $(".lectures-list-wrapper"),
                    _listCurrentScrollPosition = _list.scrollTop(),
                    _listOffsetPosition = _list.offset().top,
                    _itemOffsetPosition = _control.offset().top - _listOffsetPosition,
                    _itemCurrentScrollPosition = _control.scrollTop();

                if (_itemCurrentScrollPosition - _itemOffsetPosition !== 0) {
                    _list.scrollTop(_listCurrentScrollPosition + _itemOffsetPosition)
                }
            }

        }

        if ((prevProps.isLessonMenuOpened) && (!this.props.isLessonMenuOpened)) {
            OverflowHandler.turnOff()
        }
    }

    componentWillUnmount() {
        OverflowHandler.turnOff()
    }

    render() {
        return (
            (this.props.fetching) ?
                null
                : (
                    <div className={"lectures-list-wrapper" + (this.props.isDark ? ' _dark' : '')}>
                        <ol className="lectures-list">
                            {this._getLessonsList()}
                        </ol>
                    </div>
                )
        )
    }
}

class ListItem extends React.Component {

    static propTypes = {
        lesson: PropTypes.object,
        course: PropTypes.object,
        active: PropTypes.string,
        showAuthor: PropTypes.bool,
        isPaidCourse: PropTypes.bool,
        onLinkClick: PropTypes.func,
    };

    render() {
        let {lesson,} = this.props;

        return lesson.State !== 'D' ? this._getReadyLesson(lesson) : this._getDraftLesson(lesson)
    }

    _getReadyLesson(lesson) {
        let _isActive = this.props.active === this.props.lesson.Id,
            _cover = getCoverPath(lesson, ImageSize.icon),
            {course} = this.props;

        return (
            <li className={"lectures-list__item" + (_isActive ? ' active' : '')} id={'lesson-' + lesson.Id}>
                <Link to={'/' + this.props.courseUrl + '/' + lesson.URL} className="lectures-list__item-header" onClick={() => {
                    this.props.onLinkClick({
                            Id: course.Id,
                            Name: course.Name,
                            author: lesson.Author.FirstName + lesson.Author.LastName,
                            category: course.Categories[0].Name,
                            lessonName: lesson.Name,
                            price: course.IsPaid ? (course.DPrice ? course.DPrice : course.Price) : 0
                        })
                }}>
                    <ListItemInfo title={lesson.Name} author={lesson.Author} showAuthor={this.props.showAuthor}/>
                    <PlayBlock {...this.props} lesson={lesson} cover={_cover} isPaidCourse={this.props.isPaidCourse}/>
                </Link>
                <SubList subLessons={lesson.Lessons} course={this.props.course} active={this.props.active} onLinkClick={this.props.onLinkClick}/>
            </li>
        )
    }

    _getDraftLesson(lesson) {
        return (
            <li className="lectures-list__item lectures-list__item--old">
                <div className="lectures-list__item-header">
                    <div className="lectures-list__item-info">
                        <h3 className="lectures-list__item-title draft"><span>{lesson.Name}</span></h3>
                        {
                            this.props.showAuthor ?
                                <p className="lectures-list__item-author">{lesson.Author.FirstName + ' ' + lesson.Author.LastName}</p>
                                :
                                null
                        }
                    </div>
                    <div className="lectures-list__item-date">{lesson.readyMonth + ' ' + lesson.readyYear}</div>
                </div>
            </li>
        )
    }
}

class ListItemInfo extends React.Component {
    static propTypes = {
        title: PropTypes.string,
        author: PropTypes.object,
        showAuthor: PropTypes.bool,
    };

    render() {
        return (
            <div className="lectures-list__item-info">
                <h3 className="lectures-list__item-title"><span>{this.props.title}</span></h3>
                {
                    this.props.showAuthor ?
                        <p className="lectures-list__item-author">{this.props.author.FirstName + ' ' + this.props.author.LastName}</p>
                        :
                        null
                }
            </div>
        )
    }
}

class SubList extends React.Component {

    static propTypes = {
        subLessons: PropTypes.array.isRequired,
        course: PropTypes.object,
        active: PropTypes.string.isRequired,
        onLinkClick: PropTypes.func,
    };

    _getItems() {
        let {course} = this.props

        return this.props.subLessons.map((lesson, index) => {
            let _isActive = lesson.Id === this.props.active;
            lesson.courseUrl = this.props.course.URL;

            return <li className={"lectures-sublist__item" + (_isActive ? ' active' : '')} key={index}
                       id={'lesson-' + lesson.Id}>
                <Link to={'/' + this.props.course.URL + '/' + lesson.URL} className="lectures-sublist__title" onClick={() => {
                    this.props.onLinkClick({
                        Id: course.Id,
                        Name: course.Name,
                        author: lesson.Author.FirstName + lesson.Author.LastName,
                        category: course.Categories[0].Name,
                        lessonName: lesson.Name,
                        price: course.IsPaid ? (course.DPrice ? course.DPrice : course.Price) : 0
                    })
                }}>
                    <span className="sublist-num">{lesson.Number}</span>{lesson.Name}
                </Link>
                <div className="lectures-sublist__item-info">
                    <SubLessonPlayBlock lesson={lesson} course={this.props.course}/>
                </div>
            </li>
        })
    }

    render() {
        return this.props.subLessons.length > 0 ?
            <ol className="lectures-item__body lectures-sublist">
                {::this._getItems()}
            </ol>
            :
            null
    }
}

function mapStateToProps(state) {
    return {
        fetching: state.lessons.fetching,
        lessons: state.lessons,
        userPaidCourses : userPaidCoursesSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        lessonActions: bindActionCreators(lessonActions, dispatch),
        notifyLessonLinkClicked: bindActionCreators(notifyLessonLinkClicked, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LessonsListWrapper);