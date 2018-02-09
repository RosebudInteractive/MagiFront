import React from 'react';
import LectureWrapper from './lecture-wrapper';
import PropTypes from 'prop-types';

export default class CourseModuleBody extends React.Component {

    render() {
        let {course, isMobile} = this.props;
        let _lessonsCount = course.Lessons.length;
        let _current = _lessonsCount ? course.Lessons[0].Number : 0;

        return (
            <div className='course-module__body'>
                <Counter current={_current} total={_lessonsCount}/>
                <LectureWrapper lessons={course.Lessons} isMobile={isMobile}/>
            </div>
        );
    }
}

CourseModuleBody.propTypes = {
    course: PropTypes.object.isRequired,
    isMobile: PropTypes.bool.isRequired,
};

class Counter extends React.Component {
    render() {
        const {current, total} = this.props;

        return (
            <div className='lectures-counter'>
                <p>Лекции
                    <span className='current'>{current}</span>
                    <span className='total'>/{total}</span>
                </p>
            </div>
        )
    }
}

Counter.propTypes = {
    total: PropTypes.number.isRequired,
    current: PropTypes.number.isRequired,
};
