import React from "react"
import PropTypes from 'prop-types'

import "./lesson-tooltip.sass"
import PlayBlock from "../play-block";
import {Link} from "react-router-dom";

export default class LessonTooltip extends React.Component {
    static propTypes = {
        currentLessonUrl: PropTypes.string,
        lesson: PropTypes.object,
        course: PropTypes.object,
        isPaidCourse: PropTypes.bool,
    }

    render() {
        const {lesson, course, isPaidCourse, currentLessonUrl} = this.props

        return <div className="lesson-tooltip">
            <PlayBlock lesson={lesson} course={course} isPaidCourse={isPaidCourse} courseUrl={course.URL} lessonUrl={currentLessonUrl}/>
            <div className="lesson-tooltip__caption">
                <div className="caption__title font-universal__title-smallx">Следующий эпизод</div>
                <Link to={`/${course.URL}/${lesson.URL}`} className="caption__lesson-name font-universal__book-medium">
                    <span className="number">{`${lesson.Number}. `}</span>
                    <span className="text">{lesson.Name}</span>
                </Link>
            </div>
        </div>
    }
}

