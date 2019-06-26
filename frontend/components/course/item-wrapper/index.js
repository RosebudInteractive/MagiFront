import React from "react"
import PropTypes from "prop-types";
import * as tools from "../../../tools/page-tools";
import LazyItem from './lazyload-item'
import NotLazyItem from './not-lazyload-item'
import {enabledPaidCoursesSelector} from "ducks/app";
import {connect} from "react-redux";

class Wrapper extends React.Component {

    static propTypes = {
        course: PropTypes.object,
        lazyload: PropTypes.bool,
        index: PropTypes.number,
    };

    constructor(props) {
        super(props)

        this._getIsMobile = tools.isMobile.bind(this);
        this._isMobile = this._getIsMobile()
        this._resizeHandler = () => {
            const _newValue = this._getIsMobile()
            if (_newValue !== this._isMobile) {
                this._isMobile = _newValue
                this.forceUpdate()
            }
        }
    }

    componentDidMount() {
        window.addEventListener('resize', this._resizeHandler);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this._resizeHandler);
    }

    render() {
        let {course, lazyload, enabledPaidCourse} = this.props

        if (course && course.IsPaid && !enabledPaidCourse) {
            return null
        }

        return lazyload
            ?
            <LazyItem course={course} isMobile={this._getIsMobile()} key={course.Id} index={this.props.index}/>
            :
            <NotLazyItem course={course} isMobile={this._getIsMobile()} key={course.Id}/>
    }
}

function mapStateToProps(state) {
    return {
        enabledPaidCourse: enabledPaidCoursesSelector(state)
    }
}

export default connect(mapStateToProps)(Wrapper)