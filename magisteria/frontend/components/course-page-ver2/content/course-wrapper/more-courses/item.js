import React from 'react'
import PropTypes from 'prop-types'
import './more-courses.sass'
import {getCrownForCourse} from "tools/svg-paths";
import {Link} from "react-router-dom";

const COURSE_PAGE_INFO_SEPARATOR = <span className="course-page__info-separator">•</span>

export default class Item extends React.Component {
    static propTypes = {
        course: PropTypes.object
    }

    render() {
        const {course} = this.props,
            _coverUrl = course.LandCover ? course.LandCover : course.Cover,
            _coverMeta = course.LandCoverMeta ? course.LandCoverMeta : course.CoverMeta,
            _backgroundPosition = _coverMeta && _coverMeta.backgroundPosition ?
                {
                    top: _coverMeta.backgroundPosition.percent.top * 100 + "%",
                    left: _coverMeta.backgroundPosition.percent.left * 100 + "%",
                }
                :
                {
                    top: "top",
                    left: "center"
                },
            _coverStyle = {
                backgroundImage : "url(" + '/data/' + _coverUrl + ")",
                backgroundPositionX: _backgroundPosition.left,
                backgroundPositionY: _backgroundPosition.top,
            }

        return <div className="more-item">
            <div className="more-item__wrapper">
                <Link to={'/category/' + course.URL}>
                    <div className="more-item__cover" style={_coverStyle}>
                    <span className="more-item__course-pay-status">
                        {getCrownForCourse(this.props.course)}
                    </span>
                    </div>
                </Link>
                <div className="more-item__course-info">
                    <div className="more-item__title">
                        <Link to={'/category/' + course.URL}>
                            <span className="title__label">Курс: </span>
                            <span className="title__name">{course.Name.trim()}</span>
                        </Link>
                    </div>
                    <div className="more-item__author">
                        <span className="lesson-counter">{course.readyLessonCount}/{course.Lessons.length}</span>
                        {COURSE_PAGE_INFO_SEPARATOR}
                        <span className="info__authors">{this._getAuthorBlock()}</span>
                    </div>
                </div>
            </div>
        </div>
    }

    _getAuthorBlock(){
        return this.props.course.AuthorsObj.map((author, index, array) => {
            let _authorName = author.FirstName + ' ' + author.LastName;

            return (<React.Fragment>
                <Link to={'/autor/' + author.URL} className="author-info" key={index}>{_authorName}</Link>
                {index < array.length - 1 ? COURSE_PAGE_INFO_SEPARATOR : null}
            </React.Fragment>);
        });
    }
}