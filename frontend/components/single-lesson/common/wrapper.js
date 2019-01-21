import React from 'react'
import LessonFullWrapper from "../../common/lecture-full/wrapper";
import PropTypes from "prop-types";

export default class Wrapper extends React.Component {

    static propTypes = {
        course: PropTypes.object,
    };

    render() {
        let {course} = this.props,
            _lesson = course.Lessons[0];

        if (!_lesson.author) {
            _lesson.author = course.AuthorsObj[0];
        }

        if (!_lesson.category) {
            _lesson.category = course.CategoriesObj[0]
        }

        return <div className="lecture-full _single js-lecture-full">
            <LessonFullWrapper courseUrl={course.URL} lesson={_lesson} isSingleLesson={true}/>
        </div>
    }
}