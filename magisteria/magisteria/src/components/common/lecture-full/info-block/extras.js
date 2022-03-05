import React from "react";
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import LessonPlayBlockSmall from '../../small-play-block';
import FavoritesButton from "./favorites-button";
import {notifyLessonLinkClicked} from "ducks/google-analytics";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {CONTENT_TYPE} from "../../../../constants/common-consts";

class Extras extends React.Component {

    static propTypes = {
        subLessons: PropTypes.array,
        course: PropTypes.object,
        parentNumber: PropTypes.number,
        isPaidCourse: PropTypes.bool,
    }

    constructor(props) {
        super(props)

        this._onLessonLinkClickHandler = (e) => {

            const _lessonId = +e.target.dataset.id

            if (_lessonId) {
                const {course, subLessons} = this.props

                let _lesson = subLessons.find((item) => {return item.Id === _lessonId})

                if (_lesson) {
                    this.props.notifyLessonLinkClicked({
                        Id: course.Id,
                        Name: course.Name,
                        author: course.Authors[0].FirstName + course.Authors[0].LastName,
                        category: course.Categories[0].Name,
                        lessonName: _lesson.Name,
                        price: course.IsPaid ? (course.DPrice ? course.DPrice : course.Price) : 0
                    })
                }
            }
        }
    }

    componentDidMount() {
        $('.js-sublesson-link').bind("click", this._onLessonLinkClickHandler)
    }

    componentWillUnmount() {
        $('.js-sublesson-link').unbind("click", this._onLessonLinkClickHandler)
    }

    render() {
        const _label = (this.props.subLessons && this.props.subLessons.length > 1) ? 'Дополнительные эпизоды' : 'Дополнительный эпизод'

        return (this.props.subLessons && (this.props.subLessons.length > 0)) ?
            <div className="lecture-full__extras">
                <p className="lecture-full__extras-label">{_label}</p>
                <ol className="lecture-full__extras-extras-list extras-list">
                    {this._getList()}
                </ol>
            </div>
            :
            null
    }

    _getList() {
        const _videoIcon = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#video-lesson"/>'

        return this.props.subLessons.map((lesson, index) => {
            let url = '/' + this.props.course.URL + '/' + lesson.URL;

            lesson.courseUrl = this.props.course.URL;

            const _isYoutubeVideo = lesson.ContentType === CONTENT_TYPE.VIDEO

            return <li key={index}>
                <Link to={url} className="extras-list__item js-sublesson-link" data-id={lesson.Id}>
                    <span className="counter">{this.props.parentNumber + '.'}</span>
                    <span className="inner-counter">{lesson.Number}</span>
                    {lesson.Name + ' '}
                    <span className="duration">{lesson.DurationFmt}</span>
                    {
                        _isYoutubeVideo ?
                            <span className="item__video-icon">
                                <svg width="18" height="18" dangerouslySetInnerHTML={{__html: _videoIcon}}/>
                            </span>
                            : null
                    }
                </Link>
                <LessonPlayBlockSmall lesson={lesson} course={this.props.course} isPaidCourse={this.props.isPaidCourse}/>
                <FavoritesButton className={"extras-list__fav"} courseUrl={lesson.courseUrl} lessonUrl={lesson.URL}/>
            </li>
        })
    }
}

function mapDispatchToProps(dispatch) {
    return {
        notifyLessonLinkClicked: bindActionCreators(notifyLessonLinkClicked, dispatch),
    }
}

export default connect(null, mapDispatchToProps)(Extras)