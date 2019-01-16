import React from "react";
import {connect} from "react-redux";
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

import {authorSelector} from '../../ducks/author'
import {ImageSize, getCoverPath} from '../../tools/page-tools'
import LessonFull from "../common/lecture-full-list-item";

class CoursesBlock extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            coursesOpened: false,
            lessonsOpened: false,
        }
    }

    _getCourses(courses) {
        return courses ? (
            courses.map((course, index) => {
                return <Course course={course} key={index}/>
            })
        ) : null;
    }

    _getLessons(lessons){
        return lessons ? (
            lessons.map((lesson, index) => {
                let _cover = getCoverPath(lesson, ImageSize.small)

                return <LessonFull
                    id={lesson.Id}
                    title={lesson.Name}
                    url={'../' + lesson.courseUrl + '/' + lesson.URL}
                    courseUrl={lesson.courseUrl}
                    lessonUrl={lesson.URL}
                    descr={lesson.ShortDescription}
                    cover={_cover}
                    duration={lesson.DurationFmt}
                    totalDuration={lesson.Duration}
                    subLessons={lesson.Lessons}
                    refs={lesson.NRefBooks}
                    books={lesson.NBooks}
                    audios={lesson.Audios}
                    isAuthRequired={lesson.IsAuthRequired}
                    lesson={lesson}
                    key={index}/>
            })
        ) : null
    }

    _switchCourses() {
        this.setState({
            coursesOpened : !this.state.coursesOpened
        })
    }

    _switchLessons() {
        this.setState({
            lessonsOpened : !this.state.lessonsOpened
        })
    }

    render() {
        let {author} = this.props;

        return (
            <div className="author-block">
                <div className={"author-block__subtitle" + (this.state.coursesOpened ? ' active' : '')} onClick={::this._switchCourses}>
                    <h3>Курсы</h3>
                </div>
                <div className={"author-block__wrap author-block__content" + (this.state.coursesOpened ? ' opened' : '')}>
                    {this._getCourses(author.Courses)}
                </div>
                {/*<div className={"author-block__subtitle" + (this.state.lessonsOpened ? ' active' : '')} onClick={::this._switchLessons}>*/}
                    {/*<h3>Лекции</h3>*/}
                {/*</div>*/}
                {/*<ol className={"lectures-tab author-block__content" + (this.state.lessonsOpened ? ' opened' : '')}>*/}
                    {/*{this._getLessons(author.Lessons)}*/}
                {/*</ol>*/}
            </div>
        )
    }
}


class Course extends React.Component {

    static propTypes = {
        course: PropTypes.object,
    };

    constructor(props) {
        super(props);
    }

    render() {
        let {course} = this.props,
            _cover = getCoverPath(course, ImageSize.medium)
        const _image = '<image preserveAspectRatio="xMidYMid slice" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="/data/' + _cover + '" width="574" height="503"/>';

        return (
            <div className="course-announce">
                <div className="course-announce__col">
                    <Link to={'/category/' + course.URL} className={'course-announce__image ' + course.Mask}>
                        <svg viewBox="0 0 574 503" width="574" height="503" dangerouslySetInnerHTML={{__html: _image}}/>
                    </Link>
                </div>
                <div className="course-announce__col">
                    <h3 className="course-announce__title">
                        <Link to={'/category/' + course.URL}><span className="course-announce__label">Курс: </span><span className="course-announce__caption">{course.Name}</span></Link>
                    </h3>
                    <div className="course-announce__row">
                        <div className="course-announce__progress">
                            <span className="course-announce__progress-label">Вышло</span>
                            <span className="course-announce__progress-actual">{course.Ready}</span>
                            <span className="course-announce__progress-total">{'/' + course.Total}</span>
                        </div>
                        <Link to={'/category/' + course.URL} className="btn btn--gray course-announce__btn">Подробнее о курсе</Link>
                    </div>
                </div>
            </div>
        )
    }

}

function mapStateToProps(state) {
    return {
        author: authorSelector(state),
    }
}

export default connect(mapStateToProps)(CoursesBlock);