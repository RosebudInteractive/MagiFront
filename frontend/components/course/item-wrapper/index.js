import React from "react"
import PropTypes from "prop-types";
import * as tools from "../../../tools/page-tools";
import LazyItem from './lazyload-item'
import NotLazyItem from './not-lazyload-item'
import {enabledPaidCoursesSelector} from "ducks/app";
import {connect} from "react-redux";

class Wrapper extends React.Component {

    constructor(props) {
        super(props)

        this._isMobile = tools.isMobile.bind(this);
    }

    static propTypes = {
        course: PropTypes.object,
        lazyload: PropTypes.bool,
        index: PropTypes.number,
    };

    render() {
        let {course, lazyload, enabledPaidCourse} = this.props

        if (course && course.IsPaid && !enabledPaidCourse) {
            return null
        }

        return lazyload
            ?
            <LazyItem course={course} isMobile={this._isMobile()} key={course.Id} index={this.props.index}/>
            :
            <NotLazyItem course={course} isMobile={this._isMobile()} key={course.Id}/>
    }
}

function mapStateToProps(state) {
    return {
        enabledPaidCourse: enabledPaidCoursesSelector(state)
    }
}

export default connect(mapStateToProps)(Wrapper)