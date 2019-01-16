import React from 'react';
import PropTypes from 'prop-types';
import Wrapper from './lecture-full/wrapper';

export default class LessonFull extends React.Component {

    static propTypes = {
        courseUrl: PropTypes.string,
        needShowAuthors: PropTypes.bool,
        lesson: PropTypes.object,
    };

    // static propTypes = {
    //
    //
    //     url: PropTypes.string,
    //     courseUrl: PropTypes.string,
    //     lessonUrl: PropTypes.string,
    //     descr: PropTypes.string,
    //     cover: PropTypes.string,
    //     duration: PropTypes.string,
    //     totalDuration: PropTypes.number,
    //     subLessons: PropTypes.array,
    //     refs: PropTypes.number,
    //     books: PropTypes.number,
    //     audios: PropTypes.array,
    //     isAuthRequired: PropTypes.bool,
    //     needShowAuthors: PropTypes.bool,
    //     lesson: PropTypes.shape({
    //         id: PropTypes.number,
    //         title: PropTypes.string,
    //     }),
    // };

    render() {
        return (
            <li className="lecture-full">
                <Wrapper {...this.props}/>
            </li>
        )
    }
}