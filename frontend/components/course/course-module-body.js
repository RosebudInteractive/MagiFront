import React from 'react';
import LectureWrapper from './lessons/lecture-wrapper';
import PropTypes from 'prop-types';
import {userPaidCoursesSelector} from "ducks/profile";
import {connect} from "react-redux";

class CourseModuleBody extends React.Component {

    static propTypes = {
        course: PropTypes.object,
        isMobile: PropTypes.bool,
    }

    render() {
        let {course, isMobile, userPaidCourses} = this.props;
        let _lessonsCount = course.Lessons.length;
        let _current = course.readyLessonCount,
            _isPaidCourse = (course.IsPaid && !userPaidCourses.includes(course.Id))

        return (
            <div className='course-module__body'>
                <Counter current={_current} total={_lessonsCount}/>
                <LectureWrapper lessons={course.Lessons}  isMobile={isMobile} courseUrl={course.URL} isPaidCourse={_isPaidCourse}/>
            </div>
        );
    }
}

class Counter extends React.Component {

    static propTypes = {
        total: PropTypes.number.isRequired,
        current: PropTypes.number.isRequired,
    }

    render() {
        const {current, total} = this.props;

        return (
            <div className='lectures-counter'>
                <p>Лекции
                    <span className='current'>{' ' + current}</span>
                    <span className='total'>/{total}</span>
                </p>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        userPaidCourses : userPaidCoursesSelector(state),
    }
}

export default connect(mapStateToProps)(CourseModuleBody);