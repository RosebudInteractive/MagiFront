import React from 'react'
import PropTypes from 'prop-types'
import "./progress.sass"

export default class Progress extends React.Component {

    static propTypes = {
        course: PropTypes.object
    }

    constructor(props) {
        super(props)
    }

    render() {
        const {course} = this.props

        return <div className="course-statistic__progress">
            <div className="course-statistic__progress-title statistic-block">Прогресс:</div>
            <LessonCompleted course={course}/>
            <TestsCompleted course={course}/>
        </div>
    }
}

/**
 * @return {null}
 */
function LessonCompleted(props) {
    const _percent = (6 / 16) * 100,
        _style = {width : `${_percent}%`}

    return <div className="progress__lessons-block statistic-block">
            <span className="progress__completed">6</span>
            <span className="statistic-separator"> / </span>
            <span className="progress__total">16 </span>
            <span className="progress__text"> лекции прослушано</span>
            <div className="progress-bar" style={_style}/>
        </div>
}

/**
 * @return {null}
 */
function TestsCompleted(props) {
    const _percent = (5 / 18) * 100,
        _style = {width : `${_percent}%`}

    return <div className="progress__tests-block statistic-block">
            <span className="progress__completed">5</span>
            <span className="statistic-separator"> / </span>
            <span className="progress__total">18 </span>
            <span className="progress__text"> тестов завершено</span>
            <div className="progress-bar" style={_style}/>
        </div>
}