import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import LessonFull from './lesson-full'
import LessonPreview from './lesson-preview'

import './lessons-list.sass'

class CourseLessons extends React.Component {

    static propTypes = {
        course: PropTypes.object,
    };

    _getAuthor(authorId) {
        let _author = this.props.course.Authors.find((author) => {
            return author.Id === authorId
        })

        return _author ? _author.FirstName + ' ' + _author.LastName : ''
    }

    _getList() {
        let {course, isAdmin} = this.props,
            _needShowAuthors = (course.Authors && course.Authors.length > 1)

        return course.Lessons.map((lesson, index) => {

            lesson.authorName = _needShowAuthors ? this._getAuthor(lesson.AuthorId) : '';

            return lesson.State === 'R' ?
                <LessonFull lesson={lesson} course={course} courseUrl={this.props.course.URL} isAdmin={isAdmin} needShowAuthors={_needShowAuthors}/>
                :
                <LessonPreview lesson={lesson} key={index}/>
        })
    }

    render() {
        if (!this.props.course) {
            return null
        }

        return (
            <ol className="course-scheme__lessons-list">
                {this._getList()}
            </ol>
        );
    }
}

function mapStateToProps(state) {
    return {
        isAdmin: !!state.user.user && state.user.isAdmin,
    }
}

export default connect(mapStateToProps)(CourseLessons);