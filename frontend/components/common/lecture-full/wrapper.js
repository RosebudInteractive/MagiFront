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
        isSingleLesson: PropTypes.bool,
    };

    static defaultProps = {
        needShowAuthors: false,
        isSingleLesson: false,
    };

    render() {
        let {lesson, courseUrl} = this.props,
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


