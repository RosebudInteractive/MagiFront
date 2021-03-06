import React from 'react'
import PropTypes from 'prop-types'
import "./progress.sass"
import {Lessons, Tests} from "tools/word-tools";

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
                <TestsCompleted tests={course.statistics.tests}/>
                <TestsPercent tests={course.statistics.tests}/>
            </div>
        </div>
    }
}

/**
 * @return {null}
 */
function LessonCompleted(props) {
    const {data} = props,
        _percent = (data.finishedLessons / data.total) * 100,
        _style = {width : `${_percent}%`}

    return data.finishedLessons ?
        <div className="progress__lessons-block statistic-block">
            <span className="progress__completed">{data.finishedLessons}</span>
            <span className="statistic-separator"> / </span>
            <span className="progress__total">{`${data.total} `}</span>
            <span className="progress__text _full">{` ${Lessons.getCountTitle(data.finishedLessons)} ${Lessons.getListenedTitle(data.finishedLessons)}`}</span>
            <span className="progress__text _short">{` ${Lessons.getCountTitle(data.finishedLessons)}`}</span>
            <div className="progress-bar" style={_style}/>
        </div>
        :
        <div className="progress__lessons-block statistic-block">
            <span className="progress__completed">{data.total}</span>
            <span className="progress__text">{` ${Lessons.getCountTitle(data.total)}`}</span>
        </div>

}

/**
 * @return {null}
 */
function TestsCompleted(props) {
    const {tests} = props

    if (!tests.total) return null

    const _percent = (tests.completed / tests.total) * 100,
        _style = {width: `${_percent}%`}

    return tests.completed ?
        <div className="progress__tests-block statistic-block">
            <span className="progress__completed">{tests.completed}</span>
            <span className="statistic-separator"> / </span>
            <span className="progress__total">{tests.total}</span>
            <span className="progress__text _full">{` ${Tests.getCountTitle(tests.completed)} ${Tests.getCompletedTitle(tests.completed)}`}</span>
            <span className="progress__text _short">{` ${Tests.getCountTitle(tests.completed)}`}</span>
            <div className="progress-bar" style={_style}/>
        </div>
        :
        <div className="progress__tests-block statistic-block">
            <span className="progress__completed">{tests.total}</span>
            <span className="progress__text">{` ${Tests.getCountTitle(tests.total)}`}</span>
        </div>
}


/**
 * @return {null}
 */

function TestsPercent(props) {
    const {tests} = props

    if (!tests.percent) return null

    const _style = {width : `${tests.percent}%`}

    return <div className="progress__tests-block statistic-block">
            <span className="progress__completed">{`${tests.percent}%`}</span>
            <span className="progress__text"> верных ответов</span>
            <div className="progress-bar" style={_style}/>
        </div>
}