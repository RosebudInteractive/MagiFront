import React from 'react'
import LessonFullWrapper from "../common/lecture-full/wrapper";
import PropTypes from "prop-types";

export default class SingleLessonCourseModule extends React.Component {

    static propTypes = {
        course: PropTypes.object,
        needShowAuthors: PropTypes.bool,
    };

    render() {
        let {course, needShowAuthors} = this.props,
            _lesson = course.Lessons[0];

        if (needShowAuthors) {
            if (!_lesson.author) {
                _lesson.author = course.AuthorsObj[0];
            }

            if (!_lesson.category) {
                _lesson.category = course.CategoriesObj[0]
            }
        }

        return <div className="lecture-full _single js-lecture-full">
            <LessonFullWrapper courseUrl={course.URL} lesson={_lesson} isSingleLesson={true} needShowAuthors={needShowAuthors}/>
        </div>
    }
}