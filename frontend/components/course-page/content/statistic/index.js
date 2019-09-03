import React from 'react'
import PropTypes from 'prop-types'
import './statistic.sass'
import PlayBlock from "../../../common/play-block";
import {getCoverPath, ImageSize} from "tools/page-tools";
import Progress from './progress'

export default class Statistic extends React.Component {

    static propTypes = {
        course: PropTypes.object
    }

    constructor(props) {
        super(props)
    }

    render() {
        const {course} = this.props,
            _lesson = course.Lessons[0];

        if (typeof _lesson.CoverMeta === "string") {
            _lesson.CoverMeta = JSON.parse(_lesson.CoverMeta)
        }

        const _cover = getCoverPath(_lesson, ImageSize.small)

        return <div className="course-page__statistic">
            <div className="play-block__wrapper">
                <PlayBlock course={course} lesson={_lesson} cover={_cover} isAdmin={true}/>
            </div>
            <Progress course={course}/>
        </div>
    }
}