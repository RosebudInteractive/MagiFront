import React from "react"
import PropTypes from "prop-types";
import * as tools from "../../../tools/page-tools";
import LazyItem from './lazyload-item'
import NotLazyItem from './not-lazyload-item'


export default class Wrapper extends React.Component {

    constructor(props) {
        super(props)

        this._isMobile = tools.isMobile.bind(this);
    }

    static propTypes = {
        course: PropTypes.object,
        lazyload: PropTypes.bool,
    };

    render() {
        let {course, lazyload} = this.props

        return lazyload
            ?
            <LazyItem course={course} isMobile={this._isMobile()} key={course.Id}/>
            :
            <NotLazyItem course={course} isMobile={this._isMobile()} key={course.Id}/>
    }
}