import React from 'react';
import PropTypes from 'prop-types';

import Extras from './extras'
import TextBlock from "./text-block";
import SingleLessonTextBlock from "./single-lesson-text-block";

export default class InfoBlock extends React.Component {

    static propTypes = {
        lesson: PropTypes.object,
        course: PropTypes.object,
        needShowAuthors: PropTypes.bool,
        isSingleLesson: PropTypes.object,
    };

    static defaultProps = {
        needShowAuthors: false,
        isSingleLesson: false,
    };

    render() {
        const {lesson, course, needShowAuthors, isSingleLesson,} = this.props;

        let _isPaidCourse = (course.IsPaid && !course.IsGift && !course.IsBought)

        return (
            <div className="lecture-full__info-block">
                {isSingleLesson ?
                    <SingleLessonTextBlock course={course} lesson={lesson} needShowAuthors={needShowAuthors}/>
                    :
                    <TextBlock needShowAuthors={needShowAuthors}
                               lesson={lesson}
                               course={course}/>
                }
                {!isSingleLesson ?
                    <Extras subLessons={lesson.Lessons}
                            parentNumber={lesson.Number}
                            course={course}
                            isPaidCourse={_isPaidCourse}/>
                    :
                    null
                }

            </div>
        )
    }
}