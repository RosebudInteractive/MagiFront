import React, {Component} from 'react';
import PropTypes from 'prop-types';

import Menu from '../lesson-page/lesson-menu';
import PlayerFrame from './frame'

class Wrapper extends Component {
    static propTypes = {
        lesson: PropTypes.object.isRequired,
        courseUrl: PropTypes.string.isRequired,
        lessonUrl: PropTypes.string.isRequired,
        lessonCount: PropTypes.number.isRequired,
    };

    render() {
        return (
            <section className='fullpage-section lecture-wrapper'>
                <div className="fp-tableCell">
                    <Menu {...this.props} current={this.props.lesson.Number} total={this.props.lessonCount}/>
                    <PlayerFrame lesson={this.props.lesson}/>
                </div>
            </section>
        )
    }
}

export default Wrapper;
