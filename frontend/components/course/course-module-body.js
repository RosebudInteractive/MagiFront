import React from 'react';
import LectureWrapper from './lessons/lecture-wrapper';
import PropTypes from 'prop-types';
import {connect} from "react-redux";

class CourseModuleBody extends React.Component {

    static propTypes = {
        course: PropTypes.object,
        isMobile: PropTypes.bool,
    }

    render() {
        let {course, isMobile, isAdmin} = this.props;
        let _lessonsCount = course.Lessons.length;
        let _current = course.readyLessonCount

        return (
            <div className='course-module__body'>
                <Counter current={_current} total={_lessonsCount}/>
                <LectureWrapper lessons={course.Lessons} isMobile={isMobile} course={course} isAdmin={isAdmin}/>
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
        isAdmin: !!state.user.user && state.user.isAdmin,
    }
}

export default connect(mapStateToProps)(CourseModuleBody);