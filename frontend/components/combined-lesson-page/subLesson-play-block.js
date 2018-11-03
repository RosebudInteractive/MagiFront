import React from 'react';
import PropTypes from 'prop-types';
import {Redirect} from 'react-router';

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import * as playerStartActions from '../../actions/player-start-actions'
import * as userActions from "../../actions/user-actions";

class SubLessonPlayBlock extends React.Component {
    static propTypes = {
        lesson: PropTypes.object,
    };

    constructor(props) {
        super(props)

        this._redirect = false
    }

    _play() {
        let {lesson} = this.props

        this.props.playerStartActions.preinitAudios(lesson.Audios);
        this._redirect = true;
        this.forceUpdate()
        this.props.playerStartActions.startPlay(lesson.Id)
    }

    _startPlay() {
        let {lesson} = this.props

        if (this._isLocationPlayerPage()) {
            this.props.playerStartActions.startPlay(lesson.Id);
        } else {
            this._redirect = true;
            this.forceUpdate()
            this.props.playerStartActions.startPlay(lesson.Id);
        }
    }

    _isLocationPlayerPage() {
        let {lesson} = this.props

        let _currentLocation = window.location.pathname + window.location.search,
            _needLocation = '/' + lesson.courseUrl + '/' + lesson.URL + '?play'

        return _currentLocation === _needLocation;
    }

    _unlock() {
        this.props.userActions.showSignInForm();
    }

    _getSmallButton(isThisLessonPlaying, isFinished) {
        const _playSmall = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#play-small"/>',
            _replaySmall = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#reload-small"/>',
            _lockSmall = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#lock-small"/>'

        let {lesson, authorized} = this.props,
            {IsAuthRequired} = lesson,
            _button = null;

        if (IsAuthRequired && !authorized) {
            _button = <button className="play-btn-small paused play-btn-small_locked" onClick={::this._unlock}>
                <svg width="18" height="20" dangerouslySetInnerHTML={{__html: _lockSmall}}/>
            </button>
        } else {
            _button = isFinished
                ?
                <button type="button" className="play-btn-small paused"
                        onClick={isThisLessonPlaying ? ::this._startPlay : ::this._play}>
                    <svg width="16" height="16" dangerouslySetInnerHTML={{__html: _replaySmall}}/>
                </button>
                :
                <button type="button" className="play-btn-small"
                        onClick={isThisLessonPlaying ? ::this._startPlay : ::this._play}>
                    <svg width="12" height="11" dangerouslySetInnerHTML={{__html: _playSmall}}/>
                </button>
        }

        return _button;
    }

    render() {
        const _playSmall = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#play-small"/>',
            _radius = 86.75;

        let {lesson, playingLesson, paused, } = this.props,
            {Id: id, Duration: _totalDuration, DurationFmt: duration} = lesson,
            _lessonInfo = this.props.lessonInfoStorage.lessons.get(id),
            _isFinished = _lessonInfo ? _lessonInfo.isFinished : false,
            _currentTime = _lessonInfo ? _lessonInfo.currentTime : 0,
            _playedPart = _totalDuration ? ((_currentTime) / _totalDuration) : 0,
            _fullLineLength = 2 * 3.14 * _radius,
            _timeLineLength = 2 * 3.14 * _playedPart * _radius,
            _offset = 2 * 3.14 * 0.25 * _radius;

        let _playingLessonId = playingLesson ? playingLesson.lessonId : 0,
            _isThisLessonPlaying = _playingLessonId === id;

        if (this._redirect) {
            this._redirect = false;
            return <Redirect push to={'/' + lesson.courseUrl + '/' + lesson.URL + '?play'}/>;
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
                            this._getSmallButton(_isThisLessonPlaying, _isFinished)
                            :
                            <button className="play-btn-small paused"
                                    onClick={::this.props.playerStartActions.startPause}>
                                <svg width="8" height="10" dangerouslySetInnerHTML={{__html: _playSmall}}/>
                            </button>
                        :
                        this._getSmallButton(_isThisLessonPlaying, _isFinished)
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
        authorized: !!state.user.user,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        playerStartActions: bindActionCreators(playerStartActions, dispatch),
        userActions: bindActionCreators(userActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SubLessonPlayBlock);