import React from 'react'
import PropTypes from 'prop-types'
import Statistic from './statistic'
import CourseWrapper from './course-wrapper'
import './content.sass'

export default class Content extends React.Component {

    static propTypes = {
        course: PropTypes.object
    }

    constructor(props) {
        super(props)
    }

    render() {
        return <div className="course-page__content">
            <Statistic course={this.props.course}/>
            <CourseWrapper course={this.props.course}/>
        </div>
    }
}