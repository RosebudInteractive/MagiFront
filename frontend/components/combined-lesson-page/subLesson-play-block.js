import React from 'react';
import PropTypes from 'prop-types';
import {Redirect} from 'react-router';

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import * as playerStartActions from '../../actions/player-start-actions'
import {
    _calcLessonProps,
    _getTooltip,
    _goToLesson,
    _isLocationPlayerPage,
    _isPaidCourse,
    _play,
    _startPlay,
    _unlock,
    SMALL_SVG
} from "../common/small-play-block-functions";
import {getPaidCourseInfo,} from "ducks/billing";
import {unlockLesson} from "ducks/player";

class SubLessonPlayBlock extends React.Component {
    static propTypes = {
        lesson: PropTypes.object,
        course: PropTypes.object,
    };

    constructor(props) {
        super(props)

        this._redirect = false
        this._redirectWithoutPlay = false

        this._goToLesson = _goToLesson.bind(this)
        this._play = _play.bind(this)
        this._startPlay = _startPlay.bind(this)
        this._getTooltip = _getTooltip.bind(this)
        this._calcLessonProps = _calcLessonProps.bind(this)
        this._isLocationPlayerPage = _isLocationPlayerPage.bind(this)
        this._isPaidCourse = _isPaidCourse.bind(this)
        this._unlock = _unlock.bind(this)
    }

    _getSmallButton(isThisLessonPlaying, isFinished) {
        let {lesson, authorized,} = this.props,
            {IsAuthRequired} = lesson,
            _button = null;

        if (this._isPaidCourse() && !lesson.IsFreeInPaidCourse) {
            return <button className="play-btn-small paused" onClick={() => {this._goToLesson(isThisLessonPlaying)}}>
                <svg width="18" height="20" dangerouslySetInnerHTML={{__html: SMALL_SVG.CROWN}}/>
                <span className="play-block__tooltip">{this._getTooltip(isThisLessonPlaying, isFinished)}</span>
            </button>
        } else if (IsAuthRequired && !authorized) {
            _button = <button className="play-btn-small paused play-btn-small_locked" onClick={::this._unlock}>
                <svg width="18" height="20" dangerouslySetInnerHTML={{__html: SMALL_SVG.LOCK}}/>
                <span className="play-block__tooltip">{this._getTooltip(isThisLessonPlaying, isFinished)}</span>
            </button>
        } else {
            _button = isFinished
                ?
                <button type="button" className="play-btn-small paused"
                        onClick={isThisLessonPlaying ? ::this._startPlay : ::this._play}>
                    <svg width="16" height="16" dangerouslySetInnerHTML={{__html: SMALL_SVG.REPLAY}}/>
                    <span className="play-block__tooltip">{this._getTooltip(isThisLessonPlaying, isFinished)}</span>
                </button>
                :
                <button type="button" className="play-btn-small"
                        onClick={isThisLessonPlaying ? ::this._startPlay : ::this._play}>
                    <svg width="12" height="11" dangerouslySetInnerHTML={{__html: SMALL_SVG.PLAY}}/>
                    <span className="play-block__tooltip">{this._getTooltip(isThisLessonPlaying, isFinished)}</span>
                </button>
        }

        return _button;
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

        if (this._redirectWithoutPlay) {
            this._redirectWithoutPlay = false;
            return <Redirect push to={'/' + lesson.courseUrl + '/' + lesson.URL}/>;
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
}

function mapStateToProps(state) {
    return {
        lessonInfoStorage: state.lessonInfoStorage,
        paused: state.player.paused,
        playingLesson: state.player.playingLesson,
        authorized: !!state.user.user,
        isAdmin: !!state.user.user && state.user.user.isAdmin,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        playerStartActions: bindActionCreators(playerStartActions, dispatch),
        getPaidCourseInfo: bindActionCreators(getPaidCourseInfo, dispatch),
        unlockLesson: bindActionCreators(unlockLesson, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SubLessonPlayBlock);