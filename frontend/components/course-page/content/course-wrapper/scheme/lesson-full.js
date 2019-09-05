import {Link} from "react-router-dom";
import PlayBlock from "../../../../course-extended/sublessons/small-play-block";
import React from "react";
import PropTypes from "prop-types";

const COURSE_PAGE_INFO_SEPARATOR = <span className="course-page__info-separator">•</span>

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

        return <li className="lessons-list__item">
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
        const _flag = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#flag"/>',
            _redFlag = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#flag-red"/>'

        return this.props.subLessons.map((lesson, index) => {
            let url = '/' + this.props.courseUrl + '/' + lesson.URL;
            lesson.courseUrl = this.props.courseUrl;

            return <li key={index}>
                <Link to={url} className="extras-list__item">
                    <span className="counter">{this.props.parentNumber + '.'}</span>
                    <span className="inner-counter">{lesson.Number}</span>
                    {lesson.Name + ' '}
                    <span className="duration">{lesson.DurationFmt}</span>
                </Link>
                <PlayBlock lesson={lesson}/>
                <button className="extras-list__fav" type="button" onClick={() => {
                    this.props.onSwitchFavorites(lesson.URL)
                }}>
                    <svg width="14" height="23"
                         dangerouslySetInnerHTML={{__html: this.props.isLessonInBookmarks(lesson.URL) ? _redFlag : _flag}}/>
                </button>
            </li>
        })
    }

}