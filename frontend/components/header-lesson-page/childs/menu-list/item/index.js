import React from "react";
import PropTypes from "prop-types";
import {getCoverPath, ImageSize} from "tools/page-tools";
import {Link} from "react-router-dom";
import ItemInfo from "./item-info";
import PlayBlock from "./play-block"
import SubList from "../sublist/"
import {TEST_TYPE} from "../../../../../constants/common-consts";
import LessonTests from "../lesson-tests";

export default class MenuItem extends React.Component {

    static propTypes = {
        lesson: PropTypes.object,
        course: PropTypes.object,
        active: PropTypes.string,
        showAuthor: PropTypes.bool,
        isPaidCourse: PropTypes.bool,
        onLinkClick: PropTypes.func,
    };

    render() {
        let {lesson,} = this.props;

        return lesson.State !== 'D' ? this._getReadyLesson(lesson) : this._getDraftLesson(lesson)
    }

    _getReadyLesson(lesson) {
        let _isActive = this.props.active === this.props.lesson.Id,
            _cover = getCoverPath(lesson, ImageSize.icon),
            {course} = this.props;

        return (
            <li className={"lectures-list__item" + (_isActive ? ' active' : '')} id={'lesson-' + lesson.Id}>
                <Link to={'/' + this.props.course.URL + '/' + lesson.URL} className="lectures-list__item-header" onClick={() => {
                    this.props.onLinkClick({
                        Id: course.Id,
                        Name: course.Name,
                        author: lesson ? lesson.Author.FirstName + lesson.Author.LastName : null,
                        category: course.Categories[0].Name,
                        lessonName: lesson ? lesson.Name : null,
                        price: course.IsPaid ? (course.DPrice ? course.DPrice : course.Price) : 0
                    })
                }}>
                    <ItemInfo title={lesson.Name} author={lesson.Author} showAuthor={this.props.showAuthor}/>
                    <PlayBlock {...this.props} lesson={lesson} cover={_cover} isPaidCourse={this.props.isPaidCourse}/>
                </Link>
                <SubList subLessons={lesson.Lessons} course={this.props.course} active={this.props.active} onLinkClick={this.props.onLinkClick}/>
                <LessonTests tests={lesson.Tests}/>
            </li>
        )
    }

    _getDraftLesson(lesson) {
        return (
            <li className="lectures-list__item lectures-list__item--old">
                <div className="lectures-list__item-header">
                    <div className="lectures-list__item-info">
                        <h3 className="lectures-list__item-title draft"><span>{lesson.Name}</span></h3>
                        {
                            this.props.showAuthor ?
                                <p className="lectures-list__item-author">{lesson.Author.FirstName + ' ' + lesson.Author.LastName}</p>
                                :
                                null
                        }
                    </div>
                    <div className="lectures-list__item-date">{lesson.readyMonth + ' ' + lesson.readyYear}</div>
                </div>
            </li>
        )
    }

    _getStartedTest() {
        return this.props.course.Tests && (this.props.course.Tests.length > 0) &&
            this.props.course.Tests.find(item => item.TestTypeId === TEST_TYPE.STARTED)
    }

    _getFinishedTest() {
        return this.props.course.Tests && (this.props.course.Tests.length > 0) &&
            this.props.course.Tests.find(item => item.TestTypeId === TEST_TYPE.FINISHED)
    }
}