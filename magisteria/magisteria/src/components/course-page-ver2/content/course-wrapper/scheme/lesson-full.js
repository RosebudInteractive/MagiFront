import {Link} from "react-router-dom";
import PlayBlock from "../../../../common/small-play-block";
import React from "react";
import PropTypes from "prop-types";
import {CONTENT_TYPE} from "../../../../../constants/common-consts";
import LessonTests from "./lesson-tests";

const _videoIcon = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#video-lesson"/>'

export default class LessonFull extends React.Component{

    static propTypes = {
        course: PropTypes.object,
        lesson: PropTypes.object,
    }

    render() {
        const {lesson, course} = this.props,
            url = '/' + this.props.courseUrl + '/' + lesson.URL,
            _multiAuthors = course.Authors.length > 1,
            _title = lesson.Name.match(/[-.?!)(,:]$/g) ? lesson.Name : (lesson.Name + '.')

        lesson.courseUrl = this.props.courseUrl;

        return <React.Fragment>
            <li className="lessons-list__item">
                <div className="lessons-list__item-counter">{lesson.Number + '.'}</div>
                <div className="lessons-list__item-info">
                    <div className="item-info__inner-counter">{lesson.Number + '. '}</div>
                    <Link to={url}>
                        <span className="item-info__name">{_title}</span>
                        <span className="item-info__description">{' ' + lesson.ShortDescription + ' '}</span>
                    </Link>
                    <div className="item-info__duration">
                        <span >{lesson.DurationFmt}</span>
                        {
                            _multiAuthors ?
                                <span>{' • '}
                                    {this._getLinkToAuthor()}
                                </span>
                                :
                                null
                        }

                    </div>
                </div>
                <div className="item-info__ext">
                    <PlayBlock lesson={lesson} course={course} wrapperClass={"lessons-list__item__play-block"}/>
                </div>
            </li>
            <LessonTests tests={lesson.Tests}/>
            <ol className="course-scheme__lessons-list _sublessons">
                {this._getSublessons()}
            </ol>
        </React.Fragment>
    }

    _getLinkToAuthor() {

        const {lesson, course} = this.props,
            _author = course.Authors.find((item) => { return item.Id === lesson.AuthorId})

        return _author && <Link to={'/autor/' + _author.URL}>{_author.FirstName + ' ' + _author.LastName}</Link>
    }

    _getColor(value) {
        const _index = value % 3

        switch (_index) {
            case 0: return '_green'

            case 1: return '_yellow'

            case 2: return '_gray'

            default: return '_gray'
        }
    }

    _getSublessons() {
        return this.props.lesson.Lessons.map((lesson, index) => {

            const _url = '/' + this.props.courseUrl + '/' + lesson.URL,
                _number = `${this.props.lesson.Number}.${lesson.Number} `,
                _isYoutubeVideo = lesson.ContentType === CONTENT_TYPE.VIDEO,
                _title = lesson.Name.match(/[-.?!)(,:]$/g) ? lesson.Name : (lesson.Name + '.')

            lesson.courseUrl = this.props.courseUrl;

            return <li key={index} className="lessons-list__item">
                <div className="lessons-list__item-counter">{_number}</div>
                <div className="lessons-list__item-info">
                    <div className="item-info__inner-counter">{_number}</div>
                    <Link to={_url} className="item-info__name">{_title}</Link>
                    <span className="item-info__description">{' ' + lesson.ShortDescription + ' '}</span>
                    <div className="item-info__duration">
                        <span>{lesson.DurationFmt}</span>
                        {
                            _isYoutubeVideo ?
                                <span className="item__video-icon">
                                    <svg width="18" height="18" dangerouslySetInnerHTML={{__html: _videoIcon}}/>
                                </span>
                                : null
                        }
                    </div>
                </div>
                <PlayBlock lesson={lesson} course={this.props.course} wrapperClass={"lessons-list__item__play-block"}/>
            </li>
        })
    }

}