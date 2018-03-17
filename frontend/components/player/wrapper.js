import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

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
        onUnmute: PropTypes.func,
        onGoToContent: PropTypes.func,
        onChangeContent: PropTypes.func,
        onChangeTitle: PropTypes.func,
    };

    render() {
        return (
            <section className='fullpage-section player-wrapper'>
                    <Menu {...this.props}
                          current={this.props.lesson.Number}
                          active={this.props.active}
                          total={this.props.lessonCount}
                          id={'lesson-menu-' + this.props.lesson.Id}
                          parent={'player'}
                    />
                    <Link to={'/' + this.props.courseUrl + '/' + this.props.lesson.URL + "/transcript"} className="link-to-transcript _reduced">Транскрипт <br/>и материалы</Link>
                    <PlayerFrame {...this.props}/>
            </section>
        )
    }
}

export default Wrapper;
