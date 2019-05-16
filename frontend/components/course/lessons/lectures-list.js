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
        course: PropTypes.array.isRequired,
        isAdmin: PropTypes.bool,
    }

    render() {
        return this.props.lessons.map((item, index) => {
            return <SingleLecture lesson={item} course={this.props.course} isAdmin={this.props.isAdmin} key={index}/>
        })
    }
}