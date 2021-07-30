import React, {useEffect, useState} from 'react'
import PropTypes from 'prop-types'
import './course-wrapper.sass'
import ExtendedInfo from "./extended-info";
import Scheme from "./scheme";
import CourseBooksList from "../../../books/course-books-list";
import Books from "../../../books";
import {COURSE_VIDEO_TYPE} from "../../../../constants/common-consts";
import VideoBlock from "./video-block";
import MoreCourses from "./more-courses";
// import TimelinePreview from "../../../../../team-task/components/timelines/preview";

export default function CourseWrapper(props) {
    const {course, moreCourses} = props
    const [showMore, setShowMore] = useState(false)

    const _switchShowMore = () => {
        const _isNewStateHidden = showMore

        setShowMore(!showMore)

        if (_isNewStateHidden) {
            setTimeout(() => {window.dispatchEvent(new CustomEvent("ext-info-hidden", {}))}, 510)
        }
    }

    useEffect(() => {
        console.log('course here, ', course)
        if (course) {
            if (course.IsPaid && !course.IsGift && !course.IsBought) {
                setShowMore(true)
            }

            if (!course.IsPaid && !course.statistics.lessons.hasListened) {
                setShowMore(true)
            }
        }
    });

    // const timelines = useMemo(() => {
    //     return course.Timelines.map(tm => <TimelinePreview key={tm.Id} background={tm.Image ? tm.Image : null}
    //                                                        events={tm.Events} periods={tm.Periods}/>);
    // }, [course]);

    const _showMoreHidden = course && course.IsPaid && !course.IsGift && !course.IsBought;

    // const timelines = course.Timelines;

    return <div className="course-page__course-wrapper">
        <div className="course-wrapper__short-description wrapper-item" dangerouslySetInnerHTML={{__html: course.ShortDescription}}/>
        <ExtendedInfo course={course} visible={showMore}/>
        {
            _showMoreHidden ?
                null
                :
                <div className={"course-wrapper__more-button wrapper-item" + (showMore ? " _extended" : "")}>
                    <span onClick={_switchShowMore}>
                        {showMore ? "Свернуть информацию о курсе" : "Вся информация о курсе"}
                    </span>
                    {showMore ? " ↑ " : " ↓ "}
                </div>
        }
        <Scheme course={course}/>
        {/*{timelines}*/}
        {/*<TimelineItem*/}
        <Books books={course.Books}
               titleClassName={"course-wrapper__title"}
               listClass={CourseBooksList}
               extClass={"course-page__books wrapper-item"}
               title={"Книга по курсу"}/>
        <VideoBlock course={course} videoType={COURSE_VIDEO_TYPE.INTERVIEW}/>
        <MoreCourses courses={moreCourses}/>
    </div>
}

CourseWrapper.propTypes = {
    course: PropTypes.object,
    moreCourses: PropTypes.array
}
