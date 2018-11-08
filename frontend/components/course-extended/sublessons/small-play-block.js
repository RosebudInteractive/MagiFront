import React from 'react';
import PropTypes from 'prop-types';
import {Redirect} from 'react-router';

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import * as playerStartActions from '../../../actions/player-start-actions'
import * as userActions from "../../../actions/user-actions"

import {TooltipTitles} from "../../../tools/page-tools";

class LessonPlayBlockSmall extends React.Component {
    static propTypes = {
        wrapperClass: PropTypes.string,
        duration: PropTypes.string,
        courseUrl: PropTypes.string,
        lessonUrl: PropTypes.string,
        audios: PropTypes.array,
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
        let _currentLocation = window.location.pathname + window.location.search,
            _needLocation = '/' + this.props.lesson.courseUrl + '/' + this.props.lesson.URL + '?play'

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
            _button = <button className="extras-list__play-btn paused play-btn-small_locked" onClick={::this._unlock}>
                <svg width="14" height="14" dangerouslySetInnerHTML={{__html: _lockSmall}}/>
                <span className="lecture__tooltip">Смотреть</span>
            </button>
        } else {
            _button = isFinished
                ?
                <button type="button" className="extras-list__play-btn paused"
                        onClick={isThisLessonPlaying ? ::this._startPlay : ::this._play}>
                    <svg width="16" height="16" dangerouslySetInnerHTML={{__html: _replaySmall}}/>
                    <span className="lecture__tooltip">Смотреть</span>
                </button>
                :
                <button type="button" className="extras-list__play-btn"
                        onClick={isThisLessonPlaying ? ::this._startPlay : ::this._play}>
                    <svg width="12" height="11" dangerouslySetInnerHTML={{__html: _playSmall}}/>
                    <span className="lecture__tooltip">Смотреть</span>
                </button>
        }

        return _button;
    }

    _getTooltip(isThisLessonPlaying, isFinished){
        let {lesson , authorized, paused} = this.props,
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
            {Id: id, Duration: _totalDuration, } = lesson,
            {IsAuthRequired} = lesson,
            _lessonLocked = (IsAuthRequired && !authorized),
            _lessonInfo = this.props.lessonInfoStorage.lessons.get(id),
            _isFinished = _lessonInfo ? _lessonInfo.isFinished : false,
            _currentTime = _lessonInfo ? _lessonInfo.currentTime : 0,
            _playedPart = (_totalDuration && !_isFinished) ? ((_currentTime) / _totalDuration) : 0,
            _fullLineLength = 2 * 3.14 * _radius,
            _timeLineLength = 2 * 3.14 * _playedPart * _radius,
            _offset = 2 * 3.14 * 0.25 * _radius;

        let _playingLessonId = playingLesson ? playingLesson.lessonId : 0,
            _isThisLessonPlaying = _playingLessonId === id;

        if (this._redirect) {
            this._redirect = false;
            return <Redirect push to={'/' + lesson.courseUrl + '/' + lesson.URL + '?play'}/>;
        }

        return <div className='sublesson__play-block__wrapper'>
            {
                !_lessonLocked ?
                    <div className="play-block-small">
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
                _isThisLessonPlaying
                    ?
                    (paused)
                        ?
                        this._getSmallButton(_isThisLessonPlaying, _isFinished)
                        :
                        <button className="extras-list__play-btn paused"
                                onClick={::this.props.playerStartActions.startPause}>
                            <svg width="8" height="14" dangerouslySetInnerHTML={{__html: _pauseSmall}}/>

                        </button>
                    :
                    this._getSmallButton(_isThisLessonPlaying, _isFinished)
            }
            <span className="lecture__tooltip">{this._getTooltip(_isThisLessonPlaying, _isFinished)}</span>
        </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(LessonPlayBlockSmall);