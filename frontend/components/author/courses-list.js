import React from "react";
import PropTypes from 'prop-types';
import Course from './course-item';

export default class Courses extends React.Component {

    static propTypes = {
        courses: PropTypes.array,
    }


    constructor(props) {
        super(props);

        this.state = {
            coursesOpened: true,
        }
    }

    render() {
        let _courses = this._getRealCourses();

        return _courses && (_courses.length > 0) ?
            [
                <div className={"author-block__subtitle" + (this.state.coursesOpened ? ' active' : '')}
                     onClick={::this._switchCourses}>
                    <h3>Курсы</h3>
                </div>,
                <div
                    className={"author-block__wrap author-block__content" + (this.state.coursesOpened ? ' opened' : '')}>
                    {_courses}
                </div>
            ]
            :
            null
    }

    _switchCourses() {
        this.setState({
            coursesOpened: !this.state.coursesOpened
        })
    }

    _getRealCourses() {
        let {courses} = this.props,
            _result = []

        courses.forEach((course, index) => {
            if (!course.OneLesson) {
                _result.push(<Course course={course} key={index}/>)
            }
        })

        return _result
    }
}

