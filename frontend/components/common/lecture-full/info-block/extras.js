import React from "react";
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import LessonPlayBlockSmall from '../../small-play-block';
import FavoritesButton from "./favorites-button";

export default class Extras extends React.Component {

    static propTypes = {
        subLessons: PropTypes.array,
        course: PropTypes.object,
        parentNumber: PropTypes.number,
        isPaidCourse: PropTypes.bool,
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
        return this.props.subLessons.map((lesson, index) => {
            let url = '/' + this.props.course.URL + '/' + lesson.URL;

            lesson.courseUrl = this.props.course.URL;

            return <li key={index}>
                <Link to={url} className="extras-list__item">
                    <span className="counter">{this.props.parentNumber + '.'}</span>
                    <span className="inner-counter">{lesson.Number}</span>
                    {lesson.Name + ' '}
                    <span className="duration">{lesson.DurationFmt}</span>
                </Link>
                <LessonPlayBlockSmall lesson={lesson} course={this.props.course} isPaidCourse={this.props.isPaidCourse}/>
                <FavoritesButton className={"extras-list__fav"} courseUrl={lesson.courseUrl} lessonUrl={lesson.URL}/>
            </li>
        })
    }


}