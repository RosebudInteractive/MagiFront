import React, {useMemo} from 'react'
import PropTypes from 'prop-types'
import {Link} from "react-router-dom";

export default function LessonButton(props) {
    const {nextLessonUrl, isMobileApp, isLessonStartTest} = props

    const _button = useMemo(() => {
        return <div className="button _brown next-lesson-button">
            {isLessonStartTest ? "Перейти к лекции" : "Следующая лекция"}
        </div>
    }, isLessonStartTest)

    return nextLessonUrl ?
        isMobileApp ?
            <a href={isLessonStartTest ? "#open-lesson" : "#open-next-lesson"} className="next-lesson-button__wrapper">
                {_button}
            </a>
            :
            <Link to={nextLessonUrl} className="next-lesson-button__wrapper">
                {_button}
            </Link>
        :
        null
}

LessonButton.propTypes = {
    isMobileApp: PropTypes.bool,
    isLessonStartTest: PropTypes.bool,
    nextLessonUrl: PropTypes.string
}
