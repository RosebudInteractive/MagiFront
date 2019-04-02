import React from 'react';
import PropTypes from 'prop-types';
import Wrapper from './lecture-full/wrapper';

export default class LessonFull extends React.Component {

    static propTypes = {
        courseUrl: PropTypes.string,
        needShowAuthors: PropTypes.bool,
        lesson: PropTypes.object,
        isPaidCourse: PropTypes.bool,
    };

    render() {
        return (
            <li className="lecture-full">
                <Wrapper {...this.props}/>
            </li>
        )
    }
}