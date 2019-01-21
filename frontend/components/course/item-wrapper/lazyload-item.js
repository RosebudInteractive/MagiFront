import React from 'react'
import {lazyload} from 'react-lazyload';
import PropTypes from "prop-types";
import SingleLesson from "../../single-lesson/common/wrapper";
import CourseModule from "../course-module";

@lazyload({
    height: 200,
    once: true,
    offset: 100,
    unmountIfInvisible: true,
})
export default class Item extends React.Component {

    static propTypes = {
        course: PropTypes.object,
        isMobile: PropTypes.bool,
    };

    render() {
        let {course, isMobile} = this.props;

        return course.OneLesson ?
            <SingleLesson course={course} />
            :
            <CourseModule course={course} isMobile={isMobile} />
    }
}