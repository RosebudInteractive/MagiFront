import React from "react";
import PropTypes from "prop-types";
import {Link} from "react-router-dom";
import SubLessonPlayBlock from './play-block'

export default class SubList extends React.Component {

    static propTypes = {
        subLessons: PropTypes.array.isRequired,
        course: PropTypes.object,
        active: PropTypes.string.isRequired,
        onLinkClick: PropTypes.func,
    };

    render() {
        return this.props.subLessons.length > 0 ?
            <ol className="lectures-item__body lectures-sublist">
                {::this._getItems()}
            </ol>
            :
            null
    }

    _getItems() {
        let {course} = this.props

        return this.props.subLessons.map((lesson, index) => {
            let _isActive = lesson.Id === this.props.active;
            lesson.courseUrl = this.props.course.URL;

            return <li className={"lectures-sublist__item" + (_isActive ? ' active' : '')} key={index}
                       id={'lesson-' + lesson.Id}>
                <Link to={'/' + this.props.course.URL + '/' + lesson.URL} className="lectures-sublist__title" onClick={() => {
                    this.props.onLinkClick({
                        Id: course.Id,
                        Name: course.Name,
                        author: lesson.Author.FirstName + lesson.Author.LastName,
                        category: course.Categories ? course.Categories[0].Name : "",
                        lessonName: lesson.Name,
                        price: course.IsPaid ? (course.DPrice ? course.DPrice : course.Price) : 0
                    })
                }}>
                    <span className="sublist-num">{lesson.Number}</span>{lesson.Name}
                </Link>
                <div className="lectures-sublist__item-info">
                    <SubLessonPlayBlock lesson={lesson} course={this.props.course}/>
                </div>
            </li>
        })
    }
}