import React from "react";
import {Link} from 'react-router-dom';
import PlayBlock from './small-play-block'
import PropTypes from "prop-types";

export default class Sublessons extends React.Component {

    static propTypes = {
        subLessons: PropTypes.array,
        parentNumber: PropTypes.number,
        isLessonInBookmarks: PropTypes.func,
        onSwitchFavorites: PropTypes.func,
        courseUrl: PropTypes.string,
    };

    _getList() {
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
}