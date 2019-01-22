import React from "react";
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

import {ImageSize, getCoverPath} from '../../tools/page-tools'

export default class Courses extends React.Component {

    static propTypes = {
        courses: PropTypes.array,
    }


    constructor(props) {
        super(props);

        this.state = {
            coursesOpened: false,
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

class Course extends React.Component {

    static propTypes = {
        course: PropTypes.object,
    };

    constructor(props) {
        super(props);
    }

    render() {
        let {course} = this.props,
            _cover = getCoverPath(course, ImageSize.medium)
        const _image = '<image preserveAspectRatio="xMidYMid slice" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="/data/' + _cover + '" width="574" height="503"/>';

        return (
            <div className="course-announce">
                <div className="course-announce__col">
                    <Link to={'/category/' + course.URL} className={'course-announce__image ' + course.Mask}>
                        <svg viewBox="0 0 574 503" width="574" height="503" dangerouslySetInnerHTML={{__html: _image}}/>
                    </Link>
                </div>
                <div className="course-announce__col">
                    <h3 className="course-announce__title">
                        <Link to={'/category/' + course.URL}><span className="course-announce__label">Курс: </span><span
                            className="course-announce__caption">{course.Name}</span></Link>
                    </h3>
                    <div className="course-announce__row">
                        <div className="course-announce__progress">
                            <span className="course-announce__progress-label">Вышло</span>
                            <span className="course-announce__progress-actual">{course.Ready}</span>
                            <span className="course-announce__progress-total">{'/' + course.Total}</span>
                        </div>
                        <Link to={'/category/' + course.URL} className="btn btn--gray course-announce__btn">Подробнее о
                            курсе</Link>
                    </div>
                </div>
            </div>
        )
    }

}