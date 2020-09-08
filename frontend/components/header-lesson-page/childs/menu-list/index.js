import React from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import ListItem from "./item"

import * as lessonActions from 'actions/lesson-actions';
import {OverflowHandler} from 'tools/overflow-handler'
import $ from 'jquery'
import {userPaidCoursesSelector} from "ducks/profile";
import {notifyLessonLinkClicked} from "ducks/google-analytics";
import {lessonsSelector, authorsSelector} from "ducks/lesson-menu";
import {TEST_TYPE} from "../../../../constants/common-consts";
import TestItem from "./test-item";

class LessonsListWrapper extends React.Component {
    static propTypes = {
        isDark: PropTypes.bool,
        lesson: PropTypes.object,
        test: PropTypes.object,
    };

    constructor(props) {
        super(props);

        this._calcActiveObject(this.props)
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        this._calcActiveObject(nextProps)

        if ((!this.props.isLessonMenuOpened) && (nextProps.isLessonMenuOpened)) {
            OverflowHandler.rememberScrollPos()
        }
    }

    componentDidUpdate(prevProps) {
        if ((!prevProps.isLessonMenuOpened) && (this.props.isLessonMenuOpened)) {
            OverflowHandler.turnOnOverflow()

            let _selector = this._isLessonActive ? `#lesson-${this._activeLessonId}` : `#test-${this._activeTestId}`,
                _control = $(_selector);
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
        return <div className={"lectures-list-wrapper" + (this.props.isDark ? ' _dark' : '')}>
            <ol className="lectures-list">
                <TestItem test={this._getStartedTest()} activeTestId={this._activeTestId ? this._activeTestId : null}/>
                {this._getLessonsList()}
                <TestItem test={this._getFinishedTest()} activeTestId={this._activeTestId ? this._activeTestId : null}/>
                {this._getOtherTests()}
            </ol>
        </div>
    }

    _calcActiveObject(props) {
        const {test, lesson} = props

        this._isLessonActive = !!lesson
        this._activeLessonId = lesson ? lesson.Id : null

        this._isTestActive = !!test
        this._activeTestId = test ? test.Id : null
    }

    _getLessonsList() {
        const {lessons, authors, course, userPaidCourses, lesson: current} = this.props;

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

            return <ListItem {...this.props} lesson={lesson} course={course} showAuthor={_needShowAuthor} key={index}
                             isPaidCourse={_isPaidCourse}
                             onLinkClick={this.props.notifyLessonLinkClicked}
                             active={this._isLessonActive ? this._activeLessonId : null}
                             activeTestId={this._isTestActive ? this._activeTestId : null}/>
        });
    }

    _getStartedTest() {
        return this.props.course.Tests && (this.props.course.Tests.length > 0) &&
            this.props.course.Tests.find(item => item.TestTypeId === TEST_TYPE.STARTED)
    }

    _getFinishedTest() {
        return this.props.course.Tests && (this.props.course.Tests.length > 0) &&
            this.props.course.Tests.find(item => item.TestTypeId === TEST_TYPE.FINISHED)
    }

    _getOtherTests() {
        return this.props.course.Tests && (this.props.course.Tests.length > 0) &&
            this.props.course.Tests
                .filter((item) => {
                    return ((item.TestTypeId !== TEST_TYPE.FINISHED) && (item.TestTypeId !== TEST_TYPE.STARTED))
                })
                .map(item => <TestItem test={item} activeTestId={this._activeTestId ? this._activeTestId : null}/>)
    }
}

function mapStateToProps(state) {
    return {
        lessons: lessonsSelector(state),
        authors: authorsSelector(state),
        userPaidCourses: userPaidCoursesSelector(state),
        isLessonMenuOpened: state.app.isLessonMenuOpened,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        lessonActions: bindActionCreators(lessonActions, dispatch),
        notifyLessonLinkClicked: bindActionCreators(notifyLessonLinkClicked, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LessonsListWrapper);