import {lazyload} from "react-lazyload";
import React from "react";
import PropTypes from "prop-types";
import SingleLecture from './single-lecture'

@lazyload({
    height: 200,
    once: true,
    offset: 100,
    unmountIfInvisible: true,
})
export default class LecturesList extends React.Component {

    static propTypes = {
        lessons: PropTypes.array.isRequired,
        courseUrl: PropTypes.string.isRequired,
        isPaidCourse: PropTypes.bool,
        isAdmin: PropTypes.bool,
    }

    render() {
        return this.props.lessons.map((item, index) => {
            return <SingleLecture lesson={item} key={index} courseUrl={this.props.courseUrl} isPaidCourse={this.props.isPaidCourse}/>
        })
    }
}