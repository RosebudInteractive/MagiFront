import React from 'react'
import PropTypes from 'prop-types'
import './course-wrapper.sass'
import ExtendedInfo from "./extended-info";
import Scheme from "./scheme";
import CourseBooksList from "../../../books/course-books-list";
import Books from "../../../books";
import {COURSE_VIDEO_TYPE} from "../../../../constants/common-consts";
import VideoBlock from "./video-block";

export default class CourseWrapper extends React.Component {

    static propTypes = {
        course: PropTypes.object
    }

    constructor(props) {
        super(props)

        this.state = {
            showMore: false
        }
    }

    componentWillMount() {
        const {course} = this.props

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
        const {course} = this.props,
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
            {/*<div className="course-wrapper__about">*/}
            {/*    <div className="course-wrapper__about-title">О магистерии</div>*/}
            {/*    Истина, полагает он, начинается с отказа от заблуждения. Поэтому в начале своего трактата "О душе" он*/}
            {/*    последовательно излагает, а затем критикует все основные распространенные в его время учения о природе*/}
            {/*    души. Уже в этом обзоре и в этой критике ярко выступает эмпирический характер психологии Аристотеля,*/}
            {/*    его убеждение в тесной связи между душевными и телесными явлениями.*/}
            {/*</div>*/}
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