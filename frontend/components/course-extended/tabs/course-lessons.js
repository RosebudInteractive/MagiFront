import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import LessonFull from "../../common/lecture-full-list-item";
import LessonPreview from '../lesson/lesson-preview';
import {userPaidCoursesSelector} from "ducks/profile";

class CourseLessons extends React.Component {

    static propTypes = {
        // courseUrl: PropTypes.string.isRequired,
        course: PropTypes.object,
        needShowAuthors: PropTypes.bool,
    };

    _getAuthor(authorId) {
        let _author = this.props.course.Authors.find((author) => {
            return author.Id === authorId
        })

        return _author ? _author.FirstName + ' ' + _author.LastName : ''
    }

    _getList() {
        let {course, userPaidCourses} = this.props,
            _needShowAuthors = (course.Authors && course.Authors.length > 1),
            _isPaidCourse = (course.IsPaid && !course.IsGift && !course.IsBought && !userPaidCourses.includes(course.Id))

        return course.Lessons.map((lesson, index) => {

            lesson.authorName = _needShowAuthors ? this._getAuthor(lesson.AuthorId) : '';

            return lesson.State === 'R' ?
                <LessonFull lesson={lesson} courseUrl={this.props.course.URL} needShowAuthors={_needShowAuthors} isPaidCourse={_isPaidCourse}/>
                :
                <LessonPreview
                    title={lesson.Name}
                    readyDate={lesson.readyMonth + ' ' + lesson.readyYear}
                    key={index}
                />
        })
    }

    render() {
        if (!this.props.course) {
            return null
        }

        return (
            <ol className="lectures-tab">
                {this._getList()}
            </ol>
        );
    }
}

function mapStateToProps(state) {
    return {
        // course: state.singleCourse.object,
        userPaidCourses : userPaidCoursesSelector(state),
    }
}

export default connect(mapStateToProps)(CourseLessons);