import React from 'react';
import PropTypes from 'prop-types';

import Extras from './extras'
import TextBlock from "./text-block";

export default class InfoBlock extends React.Component {

    static propTypes = {
        lesson: PropTypes.object,
        courseUrl: PropTypes.string,
        needShowAuthors: PropTypes.bool,
    };

    render() {
        let {lesson, courseUrl, needShowAuthors,} = this.props;

        // let _lesson = {
        //     id: lesson.id,
        //     title: lesson.Name,
        //     lessonUrl: lesson.URL,
        //     descr: lesson.ShortDescription,
        //     duration: lesson.DurationFmt,
        //     totalDuration: lesson.Duration,
        //     refs: lesson.NRefBooks,
        //     books: lesson.NBooks,
        //     audios: lesson.Audios,
        //     isAuthRequired: lesson.IsAuthRequired,
        // };

        return (
                <div className="lecture-full__info-block">
                    <TextBlock needShowAuthors={needShowAuthors}
                               title={lesson.Name}
                               authorName={lesson.authorName}
                               descr={lesson.ShortDescription}
                               lessonUrl={lesson.URL}
                               courseUrl={courseUrl}/>
                    <Extras subLessons={lesson.Lessons}
                            parentNumber={lesson.Number}
                            courseUrl={courseUrl}/>
                </div>
        )
    }
}