import React from "react";
import PropTypes from 'prop-types';
import SingleLesson from '../single-lesson/common/wrapper'

export default class Lessons extends React.Component {

    static propTypes = {
        courses: PropTypes.array,
        lessons: PropTypes.array,
    }


    constructor(props) {
        super(props);

        this.state = {
            lessonsOpened: false,
        }
    }

    render() {
        let _lessons = this._getSingleLessonCourses();

        return _lessons && (_lessons.length > 0) ?
            [
                <div className={"author-block__subtitle" + (this.state.lessonsOpened ? ' active' : '')}
                     onClick={::this._switchLessons}>
                    <h3>Лекции</h3>
                </div>,
                <ol className={"lectures-tab author-block__content" + (this.state.lessonsOpened ? ' opened' : '')}>
                    {_lessons}
                </ol>
            ]
            :
            null
    }

    _switchLessons() {
        this.setState({
            lessonsOpened: !this.state.lessonsOpened
        })
    }

    _getSingleLessonCourses() {
        let {courses} = this.props,
            _result = []

        courses.forEach((course, index) => {
            if (course.OneLesson) {
                if (!course.Lessons || !course.Lessons.length) {
                    let _lesson = this._findLesson(course.Id)

                    course.Lessons = [_lesson];
                }

                if (course.Lessons.length > 0) {
                    _result.push(<SingleLesson course={course} needShowAuthors={false} key={index}/>)
                }
            }
        })

        return _result
    }

    _findLesson(courseId) {
        let {lessons} = this.props;

        return lessons ?
            lessons.find((lesson) => {
                return lesson.CourseId === courseId
            })
            :
            null
    }
}