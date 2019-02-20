import React from 'react';
import PropTypes from 'prop-types';
import {Redirect} from 'react-router';

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import * as playerStartActions from '../../actions/player-start-actions'
import * as userActions from "../../actions/user-actions";
import {TooltipTitles} from "../../tools/page-tools";

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
                <span className="play-block__tooltip">{this._getTooltip(isThisLessonPlaying, isFinished)}</span>
            </button>
        } else {
            _button = isFinished
                ?
                <button type="button" className="play-btn-small paused"
                        onClick={isThisLessonPlaying ? ::this._startPlay : ::this._play}>
                    <svg width="16" height="16" dangerouslySetInnerHTML={{__html: _replaySmall}}/>
                    <span className="play-block__tooltip">{this._getTooltip(isThisLessonPlaying, isFinished)}</span>
                </button>
                :
                <button type="button" className="play-btn-small"
                        onClick={isThisLessonPlaying ? ::this._startPlay : ::this._play}>
                    <svg width="12" height="11" dangerouslySetInnerHTML={{__html: _playSmall}}/>
                    <span className="play-block__tooltip">{this._getTooltip(isThisLessonPlaying, isFinished)}</span>
                </button>
        }

        return _button;
    }

    _getTooltip(isThisLessonPlaying, isFinished){
        let {lesson, authorized, paused} = this.props,
            {IsAuthRequired} = lesson,
            _tooltip = null;

        if (IsAuthRequired && !authorized) {
            _tooltip = TooltipTitles.locked
        } else {
            _tooltip = isThisLessonPlaying ?
                (paused ? (isFinished ? TooltipTitles.replay : TooltipTitles.play) : TooltipTitles.pause)
                :
                (isFinished ? TooltipTitles.replay : TooltipTitles.play);
        }

        return _tooltip;
    }

    render() {
        const _pauseSmall = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#pause-small"/>',
            _radius = 86.75;

        let {lesson, playingLesson, paused, authorized} = this.props,
            {IsAuthRequired} = lesson,
            _lessonLocked = (IsAuthRequired && !authorized);

        let {isFinished : _isFinished, playedPart : _playedPart} = this._calcLessonProps(lesson),
            {Id: id, DurationFmt: duration} = lesson,
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
                { !_lessonLocked ?
                    <div className="play-block__loader small">
                        <svg className="svg-loader small" width="200" height="200" viewBox="0 0 200 200"
                             version="1.1" xmlns="http://www.w3.org/2000/svg">
                            <circle className="bar" id="bar01" r={_radius} cx="100" cy="100" fill="transparent"
                                    strokeDasharray={[_timeLineLength, _fullLineLength - _timeLineLength]}
                                    strokeDashoffset={_offset} style={{strokeWidth: '18px'}}/>
                        </svg>
                    </div>
                    :
                    null
                }
                {
                    (_isThisLessonPlaying)
                        ?
                        (paused)
                            ?
                            this._getSmallButton(_isThisLessonPlaying, _isFinished)
                            :
                            <button className="play-btn-small paused"
                                    onClick={::this.props.playerStartActions.startPause}>
                                <svg width="8" height="10" dangerouslySetInnerHTML={{__html: _pauseSmall}}/>
                                <span className="play-block__tooltip">{this._getTooltip(_isThisLessonPlaying, _isFinished)}</span>
                            </button>
                        :
                        this._getSmallButton(_isThisLessonPlaying, _isFinished)
                }
                <span className="lectures-sublist__item-duration">{duration}</span>
            </div>
        )
    }

    _calcLessonProps(lesson) {
        let {lessonInfoStorage} = this.props,
            {Id: id, Duration: totalDuration} = lesson;

        let _lessonInfo = lessonInfoStorage.lessons.get(id),
            _currentTime = _lessonInfo ? _lessonInfo.currentTime : 0;

        let _playedPart = totalDuration ? ((_currentTime) / totalDuration) : 0,
            _deltaTime = Math.round(totalDuration - _currentTime);

        let _isFinished = _lessonInfo ? (_lessonInfo.isFinished || (_deltaTime <= 0)) : false;

        let result = {};

        result.playedPart = _isFinished ? 0 : _playedPart;
        result.isFinished = _isFinished;

        return result
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