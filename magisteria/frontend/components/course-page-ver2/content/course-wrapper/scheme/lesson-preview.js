import React from "react";
import PropTypes from "prop-types";

export default class LessonPreview extends React.Component {

    static propTypes = {
        lesson: PropTypes.object,
    }


    render() {
        const {lesson,} = this.props,
            _title=lesson.Name + ' ',
            _readyDate=lesson.readyMonth + ' ' + lesson.readyYear

        return <React.Fragment>
            <li className="lessons-list__item _preview">
                <div className="lessons-list__item-counter">{lesson.Number + '.'}</div>
                <div className="lessons-list__item-info">
                    <div className="item-info__inner-counter">{lesson.Number + '. '}</div>
                    <div className="item-info__name">{_title}</div>
                </div>
                <div className="item-info__ready-date">{_readyDate}</div>
            </li>
        </React.Fragment>
    }
}