import React from 'react';
import PropTypes from 'prop-types';

import PlayBlock from '../play-block';
import InfoBlock from './info-block';
import {getCoverPath, ImageSize} from "../../../tools/page-tools";

export default class LessonFullWrapper extends React.Component {

    static propTypes = {
        lesson: PropTypes.object,
        course: PropTypes.object,
        isAdmin: PropTypes.bool,

        needShowAuthors: PropTypes.bool,
        isSingleLesson: PropTypes.bool,
    };

    static defaultProps = {
        needShowAuthors: false,
        isSingleLesson: false,
    };

    render() {
        let {lesson, course, isAdmin,} = this.props,
            _cover = getCoverPath(lesson, ImageSize.medium)

        return (
            <div className="lecture-full__wrapper">
                <PlayBlock lesson={lesson} course={course} cover={_cover} isAdmin={isAdmin}/>
                <InfoBlock {...this.props}/>
            </div>
        )
    }
}


