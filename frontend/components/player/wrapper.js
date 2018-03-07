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
        content: PropTypes.array.isRequired,
        currentContent: PropTypes.number,
        onPause: PropTypes.func,
        onSetRate:  PropTypes.func,
        onMute:  PropTypes.func,
        onGoToContent: PropTypes.func,
        onChangeContent: PropTypes.func,
        onChangeTitle: PropTypes.func,
    };

    render() {
        return (
            <section className='fullpage-section lecture-wrapper'>
                <div className="fp-tableCell">
                    <Menu {...this.props} current={this.props.lesson.Number} total={this.props.lessonCount}/>
                    <PlayerFrame {...this.props}/>
                </div>
            </section>
        )
    }
}

export default Wrapper;
