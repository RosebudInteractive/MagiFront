import React from 'react'
import PropTypes from 'prop-types'
import './course-wrapper.sass'
import ExtendedInfo from "./extended-info";
import Scheme from "./scheme";
import CourseBooksList from "../../../books/course-books-list";
import Books from "../../../books";
import {COURSE_VIDEO_TYPE} from "../../../../constants/common-consts";
import VideoBlock from "./video-block";
import MoreCourses from "./more-courses";

export default class CourseWrapper extends React.Component {

    static propTypes = {
        course: PropTypes.object,
        moreCourses: PropTypes.array
    }

    constructor(props) {
        super(props)

        this.state = {
            showMore: false
        }
    }

    componentWillMount() {
        const {course, moreCourses} = this.props

        if (course) {
            if (course.IsPaid && !course.IsGift && !course.IsBought) {
                this.setState({showMore: true})
            }

            if (!course.IsPaid && !course.statistics.lessons.hasListened) {
                this.setState({showMore: true})
            }
        }
    }

    render() {
        const {course, moreCourses} = this.props,
            _showMoreHidden = course && course.IsPaid && !course.IsGift && !course.IsBought

        return <div className="course-page__course-wrapper">
            <div className="course-wrapper__short-description wrapper-item" dangerouslySetInnerHTML={{__html: course.ShortDescription}}/>
            <ExtendedInfo course={course} visible={this.state.showMore}/>
            {
                _showMoreHidden ?
                    null
                    :
                    <div className={"course-wrapper__more-button wrapper-item" + (this.state.showMore ? " _extended" : "")}>
                        <span
                            onClick={::this._switchShowMore}>{this.state.showMore ? "Свернуть информацию о курсе" : "Вся информация о курсе"}</span>
                        {this.state.showMore ? " ↑ " : " ↓ "}
                    </div>
            }
            <Scheme course={course}/>
            <Books books={this.props.course.Books}
                   titleClassName={"course-wrapper__title"}
                   listClass={CourseBooksList}
                   extClass={"course-page__books wrapper-item"}
                   title={"Книга по курсу"}/>
            <VideoBlock course={course} videoType={COURSE_VIDEO_TYPE.INTERVIEW}/>
            <MoreCourses courses={moreCourses}/>
        </div>
    }

    _switchShowMore() {
        const _isNewStateHidden = !this.state.showMore

        this.setState({
            showMore: !this.state.showMore
        })

        if (_isNewStateHidden) {
            window.dispatchEvent(new CustomEvent("ext-info-hidden", {}))
        }
    }
}