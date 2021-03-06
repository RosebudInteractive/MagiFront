import React from 'react'
import PropTypes from 'prop-types'
import "./statistic-data.sass"
import {getCountSubsTitle, Lessons, Tests,} from "tools/word-tools";

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
                <div className="data__first-block">
                    <ReadyDate data={course.statistics.lessons}/>
                    <TotalLessonCounter data={course.statistics.lessons}/>
                    <div className="data__counters-wrapper">
                        <SublessonsCounter count={course.statistics.lessons.sublessonsCount}/>
                        <VideoCounter duration={course.statistics.lessons.duration} inLine={true}/>
                    </div>
                    <TotalTestsCounter data={course.statistics.tests}/>
                    <VideoCounter duration={course.statistics.lessons.duration} inLine={false}/>
                </div>
            </div>
    }
}


/**
 * @return {null}
 */
function TotalLessonCounter(props) {
    const {data} = props

    return <div className="data__header-block statistic__data-block">
        <span className="progress__completed">{data.published}</span>
        { !data.allPublished ?
            <React.Fragment>
                <span className="statistic-separator">/</span>
                <span className="progress__total">{data.total}</span>
            </React.Fragment>
            :
            null
        }
        <span className="data__text">{`${Lessons.getCountTitle(data.total)}`}</span>
    </div>
}

/**
 * @return {null}
 */
function TotalTestsCounter(props) {
    const {data} = props

    return data.total ?
        <div className="statistic__data-block">
            <div className="data__header-block">
                <span className="progress__completed">{data.total}</span>
                <span className="data__text">{Tests.getCountTitle(data.total)}</span>
            </div>
        </div>
        :
        null
}


const PUBLISHING = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#publishing"/>'
/**
 * @return {null}
 */
function ReadyDate(props) {
    const {data} = props

    if (data.allPublished) return null

    const _readyDate = data.readyDate.readyMonth.toLocaleLowerCase() + ' ' + data.readyDate.readyYear

    return !data.allPublished ?
                <div className="data__ready-date">
                    <svg width="22" height="22" dangerouslySetInnerHTML={{__html: PUBLISHING}}/>
                    <div className="ready-date__text-block font-universal__body-small">
                        {`???????? ?? ???????????????? ????????????????????. ?????????? ???????????????????? ???????????????????? ???????? ???????????? - ${_readyDate}`}
                    </div>
                </div>
                :
                null
}


/**
 * @return {null}
 */
function VideoCounter(props) {
    const {duration, inLine} = props

    return <div className={"data__info-block statistic__data-block video-data" + (inLine ? " _inline" : " _column")}>
        <span className="progress__completed">{duration.hours}</span>
        <span className="data__text">{'??'}</span>
        <span className="data_separator"/>
        <span className="progress__completed">{' ' + duration.minutes}</span>
        <span className="data__text view-time _full">{'?? - ?????????? ??????????????????'}</span>
        <span className="data__text view-time _short">{'?? ??????????????????'}</span>
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
