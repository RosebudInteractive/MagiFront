import React from 'react';
import PropTypes from 'prop-types';

import Extras from './extras'
import TextBlock from "./text-block";
import SingleLessonTextBlock from "./single-lesson-text-block";

export default class InfoBlock extends React.Component {

    static propTypes = {
        lesson: PropTypes.object,
        courseUrl: PropTypes.string,
        needShowAuthors: PropTypes.bool,
        isSingleLesson: PropTypes.object,
        isPaidCourse: PropTypes.bool,
    };

    static defaultProps = {
        needShowAuthors: false,
        isSingleLesson: false,
    };

    render() {
        let {lesson, courseUrl, needShowAuthors, isSingleLesson, isPaidCourse} = this.props;

        return (
            <div className="lecture-full__info-block">
                {isSingleLesson ?
                    <SingleLessonTextBlock courseUrl={courseUrl} lesson={lesson} needShowAuthors={needShowAuthors}/>
                    :
                    <TextBlock needShowAuthors={needShowAuthors}
                               title={lesson.Name}
                               authorName={lesson.authorName}
                               descr={lesson.ShortDescription}
                               lessonUrl={lesson.URL}
                               courseUrl={courseUrl}/>
                }
                {!isSingleLesson ?
                    <Extras subLessons={lesson.Lessons}
                            parentNumber={lesson.Number}
                            courseUrl={courseUrl}
                            isPaidCourse={isPaidCourse}/>
                    :
                    null
                }

            </div>
        )
    }
}