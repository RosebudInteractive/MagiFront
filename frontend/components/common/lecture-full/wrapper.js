import React from 'react';
import PropTypes from 'prop-types';

import PlayBlock from '../play-block';
import InfoBlock from './info-block';
import {getCoverPath, ImageSize} from "../../../tools/page-tools";

export default class LessonFullWrapper extends React.Component {

    static propTypes = {
        courseUrl: PropTypes.string,
        needShowAuthors: PropTypes.bool,
        lesson: PropTypes.object,
    };

    render() {
        let {lesson, courseUrl} = this.props,
            _lesson = {
                id: lesson.id,
                title: lesson.Name,
                lessonUrl: lesson.URL,
                descr: lesson.ShortDescription,
                duration: lesson.DurationFmt,
                totalDuration: lesson.Duration,
                refs: lesson.NRefBooks,
                books: lesson.NBooks,
                audios: lesson.Audios,
                isAuthRequired: lesson.IsAuthRequired,
            },
            _cover = getCoverPath(lesson, ImageSize.small)

        return (
            <div className="lecture-full__wrapper">
                <PlayBlock id={lesson.Id} courseUrl={courseUrl} lessonUrl={lesson.URL}
                           isAuthRequired={lesson.isAuthenticated} audios={lesson.Audios} cover={_cover}
                           duration={lesson.DurationFmt} totalDuration={lesson.Duration}/>
                <InfoBlock {...this.props}/>
            </div>
        )
    }
}


