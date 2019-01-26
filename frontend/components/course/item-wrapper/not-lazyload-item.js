import React from 'react'
import PropTypes from "prop-types";
import SingleCourseLesson from "../single-lesson-course-module";
import CourseModule from "../course-module";

export default class Item extends React.Component {

    static propTypes = {
        course: PropTypes.object,
        isMobile: PropTypes.bool,
    };

    render() {
        let {course, isMobile} = this.props;

        return course.OneLesson ?
            <SingleCourseLesson course={course} needShowAuthors={true} />
            :
            <CourseModule course={course} isMobile={isMobile} />
    }
}