import React from 'react'
import PropTypes from 'prop-types'
import "./progress.sass"
import {getCountLessonTitle, getCountListenedTitle} from "tools/word-tools";

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
            <div className="progress__completed-wrapper">
                <LessonCompleted data={course.statistics.lessons}/>
                <TestsCompleted course={course}/>
            </div>
        </div>
    }
}

/**
 * @return {null}
 */
function LessonCompleted(props) {
    const {data} = props,
        _percent = (data.finishedLessons / 16) * 100,
        _style = {width : `${_percent}%`}

    return <div className="progress__lessons-block statistic-block">
            <span className="progress__completed">{data.finishedLessons}</span>
            <span className="statistic-separator"> / </span>
            <span className="progress__total">{`${data.total} `}</span>
            <span className="progress__text _full">{` ${getCountLessonTitle(data.finishedLessons)} ${getCountListenedTitle(data.finishedLessons)}`}</span>
            <span className="progress__text _short">{` ${getCountLessonTitle(data.finishedLessons)}`}</span>
            <div className="progress-bar" style={_style}/>
        </div>
}

/**
 * @return {null}
 */
function TestsCompleted(props) {
    // const _percent = (5 / 18) * 100,
    //     _style = {width : `${_percent}%`}
    //
    // return <div className="progress__tests-block statistic-block">
    //         <span className="progress__completed">5</span>
    //         <span className="statistic-separator"> / </span>
    //         <span className="progress__total">18 </span>
    //         <span className="progress__text _full"> тестов завершено</span>
    //         <span className="progress__text _short"> тестов</span>
    //         <div className="progress-bar" style={_style}/>
    //     </div>

    return null
}