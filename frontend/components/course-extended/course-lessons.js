import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import LessonFull from "../common/lecture-full-wrapper";
import LessonPreview from './lesson-preview';
import {ImageSize, getCoverPath} from '../../tools/page-tools'

class CourseLessons extends React.Component {

    static propTypes = {
        courseUrl: PropTypes.string.isRequired,
        needShowAuthors: PropTypes.bool,
    };

    _getAuthor(authorId) {
        let _author = this.props.course.Authors.find((author) => {
            return author.Id === authorId
        })

        return _author ? _author.FirstName + ' ' + _author.LastName : ''
    }

    _getList() {
        let {course} = this.props,
            _needShowAuthors = (course.Authors && course.Authors.length > 1);

        return course.Lessons.map((lesson, index) => {
            let _cover = getCoverPath(lesson, ImageSize.small)

            lesson.authorName = _needShowAuthors ? this._getAuthor(lesson.AuthorId) : '';

            return lesson.State === 'R' ?
                <LessonFull
                    id={lesson.Id}
                    title={lesson.Name}
                    url={'../' + this.props.courseUrl + '/' + lesson.URL}
                    courseUrl={this.props.courseUrl}
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
                    key={index}
                    needShowAuthors={_needShowAuthors}/>
                :
                <LessonPreview
                    title={lesson.Name}
                    readyDate={lesson.readyMonth + ' ' + lesson.readyYear}
                    key={index}
                />
        })
    }

    render() {
        if (!this.props.course) {
            return null
        }

        return (
            <ol className="lectures-tab">
                {this._getList()}
            </ol>
        );
    }
}

function mapStateToProps(state) {
    return {
        course: state.singleCourse.object,
    }
}

export default connect(mapStateToProps)(CourseLessons);