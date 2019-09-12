import React from 'react'
import PropTypes from 'prop-types'
import VideoBlock from "./video-block";
import Tabs from "../course-extended/tabs";
import ContentWrapper from "./content";

export default class Wrapper extends React.Component {

    static propTypes = {
        isFavorite: PropTypes.bool,
        onFavoritesClick: PropTypes.func,
        shareUrl: PropTypes.string,
        course: PropTypes.object,
    }

    render() {
        const {course} = this.props

        return <div className="courses">
            <ContentWrapper {...this.props}/>
            <VideoBlock course={course}/>
            <Tabs
                lessons={{total: course.lessonCount, ready: course.readyLessonCount}}
                books={{total: course.RefBooks.length}}
                course={course}
            />
        </div>
    }

}




