import {Link} from "react-router-dom";
import PlayBlock from "../../../../course-extended/sublessons/small-play-block";
import React from "react";
import PropTypes from "prop-types";
import {CONTENT_TYPE} from "../../../../../constants/common-consts";

const _videoIcon = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#video-lesson"/>'

export default class LessonFull extends React.Component{

    static propTypes = {
        course: PropTypes.object,
        lesson: PropTypes.object,
    }

    render() {
        const _completeStatus = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#complete-status"/>',
            _flag = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#flag"/>',
            _redFlag = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#flag-red"/>'

        const {lesson} = this.props,
            url = '/' + this.props.courseUrl + '/' + lesson.URL;
        lesson.courseUrl = this.props.courseUrl;

        return <React.Fragment>
                <li className="lessons-list__item">
                    <div className="lessons-list__item-counter">{lesson.Number + '.'}</div>
                    <div className="lessons-list__item-info">
                        <div className="item-info__inner-counter">{lesson.Number + '. '}</div>
                        <Link to={url} className="item-info__name">{lesson.Name + ' '}</Link>
                        <div className="item-info__duration">
                            <span >{lesson.DurationFmt}</span>
                            <span>
                                <Link to={'#'}>{' • Михаил Свердлов'}</Link>
                            </span>
                        </div>
                    </div>
                    <div className="item-info__ext">
                        {/*<div className={"item-info__ext-complete-status " + this._getColor(lesson.Id)}>*/}
                        {/*    <svg width="18" height="18"*/}
                        {/*         dangerouslySetInnerHTML={{__html: _completeStatus}}/>*/}
                        {/*</div>*/}
                        <PlayBlock lesson={lesson}/>
                        {/*<div className={"item-info__arrow-down"}/>*/}
                    </div>
                </li>
                <ol className="course-scheme__lessons-list _sublessons">
                    {this._getSublessons()}
                </ol>
            </React.Fragment>

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
                 _isYoutubeVideo = lesson.ContentType === CONTENT_TYPE.VIDEO

            lesson.courseUrl = this.props.courseUrl;

            return <li key={index} className="lessons-list__item">
                <div className="lessons-list__item-counter">{_number}</div>
                <div className="lessons-list__item-info">
                    <div className="item-info__inner-counter">{_number}</div>
                    <Link to={_url} className="item-info__name">{lesson.Name + ' '}</Link>
                    <div className="item-info__duration">
                        <span >{lesson.DurationFmt}</span>
                        {
                            _isYoutubeVideo ?
                                <span className="item__video-icon">
                                    <svg width="18" height="18" dangerouslySetInnerHTML={{__html: _videoIcon}}/>
                                </span>
                                : null
                        }
                    </div>
                </div>
                <PlayBlock lesson={lesson}/>
            </li>
        })
    }

}