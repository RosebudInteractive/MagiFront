import React from "react";
import PropTypes from 'prop-types';
import LessonFullWrapper from "../common/lecture-full/wrapper";

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
                let _lesson = this._findLesson(course.Id)

                if (_lesson) {
                    _result.push(<Lesson course={course} needShowAuthors={false} lesson={_lesson} key={index}/>)
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


class Lesson extends React.Component {

    static propTypes = {
        course: PropTypes.object,
        lesson: PropTypes.object,
        needShowAuthors: PropTypes.bool,
    };

    render() {
        let {course, lesson, needShowAuthors} = this.props;

        return <div className="lecture-full">
            <LessonFullWrapper courseUrl={course.URL} lesson={lesson} isSingleLesson={true} needShowAuthors={needShowAuthors}/>
        </div>
    }
}