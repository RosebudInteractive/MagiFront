import React from 'react';
import PropTypes from 'prop-types';
import {Redirect} from 'react-router';

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import * as playerStartActions from '../../actions/player-start-actions'

class SubLessonPlayBlock extends React.Component {
    static propTypes = {
        cover: PropTypes.string.isRequired,
        duration: PropTypes.string.isRequired,
        courseUrl: PropTypes.string.isRequired,
        lessonUrl: PropTypes.string.isRequired,
        audios: PropTypes.array.isRequired,
    };

    constructor(props) {
        super(props)

        this._redirect = false
    }

    _play() {
        this.props.playerStartActions.preinitAudios(this.props.audios);
        this._redirect = true;
        this.forceUpdate()
    }

    render() {
        const _playSmall = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#play-small"></use>',
            _replaySmall = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#reload-small"/>',
            _pauseSmall = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#pause-small"/>',
            _radius = 86.75;

        let {id, totalDuration, playingLesson, paused, duration} = this.props,
            _lessonInfo = this.props.lessonInfoStorage.lessons.get(id),
            _isFinished = _lessonInfo ? _lessonInfo.isFinished : false,
            _currentTime = _lessonInfo ? _lessonInfo.currentTime : 0,
            _playedPart = totalDuration ? ((_currentTime) / totalDuration) : 0,
            _fullLineLength = 2 * 3.14 * _radius,
            _timeLineLength = 2 * 3.14 * _playedPart * _radius,
            _offset = 2 * 3.14 * 0.25 * _radius;

        let _playingLessonId = playingLesson ? playingLesson.lessonId : 0,
            _isThisLessonPlaying = _playingLessonId === id;

        if (this._redirect) {
            this._redirect = false;
            return <Redirect push to={'/' + this.props.courseUrl + '/' + this.props.lessonUrl + '?play'}/>;
        }

        return (
            <div className="lectures-sublist__play-block">
                <div className="play-block__loader small">
                    <svg className="svg-loader small" width="200" height="200" viewBox="0 0 200 200"
                         version="1.1" xmlns="http://www.w3.org/2000/svg">
                        <circle className="bar" id="bar01" r={_radius} cx="100" cy="100" fill="transparent"
                                strokeDasharray={[_timeLineLength, _fullLineLength - _timeLineLength]}
                                strokeDashoffset={_offset} style={{strokeWidth: '18px'}}/>
                    </svg>
                </div>
                {
                    (_isThisLessonPlaying)
                        ?
                        (paused)
                            ?
                            (_isFinished)
                                ?
                                <button type="button" className="play-btn-small paused"
                                        onClick={::this.props.playerStartActions.startPlay}>
                                    <svg width="16" height="16" dangerouslySetInnerHTML={{__html: _replaySmall}}/>
                                    <span>Пауза</span>
                                </button>
                                :
                                <button type="button" className="play-btn-small"
                                        onClick={::this.props.playerStartActions.startPlay}>
                                    <svg width="12" height="11" dangerouslySetInnerHTML={{__html: _playSmall}}/>
                                    <span>Воспроизвести</span>
                                </button>

                            :
                            <button type="button" className="play-btn-small paused"
                                    onClick={::this.props.playerStartActions.startPause}>
                                <svg width="8" height="10" dangerouslySetInnerHTML={{__html: _pauseSmall}}/>
                                <span>Пауза</span>
                            </button>
                        :
                        (_isFinished)
                            ?
                            <button type="button" className="play-btn-small paused"
                                    onClick={::this._play}>
                                <svg width="16" height="16" dangerouslySetInnerHTML={{__html: _replaySmall}}/>
                                <span>Пауза</span>
                            </button>
                            :
                            <button type="button" className="play-btn-small" onClick={::this._play}>
                                <svg width="12" height="11" dangerouslySetInnerHTML={{__html: _playSmall}}/>
                                <span>Воспроизвести</span>
                            </button>
                }
                <span className="lectures-sublist__item-duration">{duration}</span>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        lessonInfoStorage: state.lessonInfoStorage,
        paused: state.player.paused,
        playingLesson: state.player.playingLesson,

    }
}

function mapDispatchToProps(dispatch) {
    return {
        playerStartActions: bindActionCreators(playerStartActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SubLessonPlayBlock);