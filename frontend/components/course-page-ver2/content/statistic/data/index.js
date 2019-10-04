import React from 'react'
import PropTypes from 'prop-types'
import "./statistic-data.sass"
import {getCountLessonTitle, getCountSubsTitle} from "tools/word-tools";

export default class Data extends React.Component {

    static propTypes = {
        course: PropTypes.object
    }

    constructor(props) {
        super(props)
    }

    render() {
        const {course} = this.props

        return <div className="statistic__data-wrapper">
                <div className="data__first-block statistic__data-block">
                    <TotalLessonCounter data={course.statistics.lessons}/>
                    <ReadyDate data={course.statistics.lessons}/>
                </div>
                <div className="data__counters-wrapper">
                    <VideoCounter duration={course.statistics.lessons.duration}/>
                    <SublessonsCounter count={course.statistics.lessons.sublessonsCount}/>
                </div>
            </div>
    }
}


/**
 * @return {null}
 */
function TotalLessonCounter(props) {
    const {data} = props

    return <div className="data__header-block">
        <span className="progress__completed">{data.published}</span>
        { !data.allPublished ?
            <React.Fragment>
                <span className="statistic-separator">/</span>
                <span className="progress__total">{data.total}</span>
            </React.Fragment>
            :
            null
        }
        <span className="data__text">{`${getCountLessonTitle(data.total)}`}</span>
    </div>
}

/**
 * @return {null}
 */
function ReadyDate(props) {
    const {data} = props

    if (data.allPublished) return null

    const _readyDate = data.readyDate.readyMonth.toLocaleLowerCase() + ' ' + data.readyDate.readyYear

    return !data.allPublished ?
                <div className="data__ready-date">
                    <div className="data__text">Курс в процессе публикации.</div>
                    <div className="data__text">{`Время завершения публикации всех лекций - ${_readyDate}`}</div>
                </div>
                :
                null
}


/**
 * @return {null}
 */
function VideoCounter(props) {
    const {duration} = props

    return <div className="data__info-block statistic__data-block video-data">
        <span className="progress__completed">{duration.hours}</span>
        <span className="data__text">{'ч'}</span>
        <span className="data_separator"/>
        <span className="progress__completed">{' ' + duration.minutes}</span>
        <span className="data__text _full">{'м - время просмотра'}</span>
        <span className="data__text _short">{'м просмотра'}</span>
    </div>
}

/**
 * @return {null}
 */
function SublessonsCounter(props) {
    const {count} = props

    return count ?
        <div className="data__info-block statistic__data-block">
            <span className="progress__completed">{count}</span>
            <span className="data__text">{` ${getCountSubsTitle(count)}`}</span>
        </div>
        :
        null
}