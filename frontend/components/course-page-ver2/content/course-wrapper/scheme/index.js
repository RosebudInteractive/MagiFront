import React from 'react'
import PropTypes from 'prop-types'
import './scheme.sass'
import LessonsList from './lessons-list'

export default class Scheme extends React.Component {

    static propTypes = {
        course: PropTypes.object,
        visible: PropTypes.bool,
    }

    constructor(props) {
        super(props)
    }

    render() {
        const {course} = this.props

        return <div className="course-wrapper__scheme">
            <div className="course-scheme__title">Программа курса </div>
            <LessonsList course={course}/>
        </div>
    }
}