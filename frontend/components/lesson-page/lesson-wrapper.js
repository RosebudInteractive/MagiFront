import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

import Menu from './lesson-menu';
import LessonFrame from './lesson-frame';

export default class LessonWrapper extends React.Component {

    static propTypes = {
        lesson: PropTypes.object.isRequired,
        courseUrl: PropTypes.string.isRequired,
        lessonUrl: PropTypes.string.isRequired,
        lessonCount: PropTypes.number.isRequired,
        isMain: PropTypes.bool,
    };

    static defaultProps = {
        isMain: true
    };

    render() {
        return (
            <section className='fullpage-section lecture-wrapper'
                     style={{backgroundImage: "url(" + '/data/' + this.props.lesson.Cover + ")"}}>
                    <Menu {...this.props} current={this.props.lesson.Number} total={this.props.lessonCount}/>
                    <Link to={this.props.lessonUrl + "/transcript"} className="link-to-transcript">Транскрипт <br/>и
                        материалы</Link>
                    <LessonFrame lesson={this.props.lesson} isMain={this.props.isMain} courseUrl={this.props.courseUrl}/>
            </section>
        )
    }
}