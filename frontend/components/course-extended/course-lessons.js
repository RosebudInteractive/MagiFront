import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {LessonFull, LessonPreview} from "../common/lecture-full-wrapper";
import {ImageSize, getCoverPath} from '../../tools/page-tools'

class CourseLessons extends React.Component {

    static propTypes = {
        courseUrl: PropTypes.string.isRequired
    };

    _getList() {
        return this.props.course.Lessons.map((lesson, index) => {
            let _cover = getCoverPath(lesson, ImageSize.small)

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
                    subLessons={lesson.NSub}
                    refs={lesson.NRefBooks}
                    books={lesson.NBooks}
                    audios={lesson.Audios}
                    isAuthRequired={lesson.IsAuthRequired}
                    key={index}/>
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