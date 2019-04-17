import React from 'react';
import PropTypes from 'prop-types';

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import * as playerStartActions from '../../actions/player-start-actions'
import * as userActions from "../../actions/user-actions";
import $ from "jquery";
import history from '../../history';
import {TooltipTitles} from "../../tools/page-tools";
import {FINISH_DELTA_TIME} from "../../constants/player";

class PlayBlock extends React.Component {
    static propTypes = {
        cover: PropTypes.string,
        lesson: PropTypes.object,
        extClass: PropTypes.string,
        isPaidCourse: PropTypes.bool,
    };

    constructor(props) {
        super(props)
    }

    _play(e) {
        if (e) e.preventDefault()

        let {lesson, courseUrl, lessonUrl} = this.props,
            _audios = Object.values(lesson.Audios);

        this.props.playerStartActions.preinitAudios(_audios);

        if ((lesson.courseUrl === courseUrl) && (lesson.URL === lessonUrl)) {
            history.replace('/' + courseUrl + '/' + lesson.URL + '?play')
            this.forceUpdate()
        } else {
            let _url = '/' + courseUrl + '/' + lesson.URL;

            history.push({
                pathname: _url,
                search: '?play',
            })
        }

        this.props.playerStartActions.startPlay(lesson.Id)
    }

    _startPlay() {
        let scrollTarget = $('.js-player').outerHeight() - $(window).height();
        $('html, body').animate({
            scrollTop: scrollTarget
        }, 600, () => {
            this.props.playerStartActions.startPlay(this.props.lesson.Id);
        });
    }

    _unlock() {
        this.props.userActions.showSignInForm();
    }

    _goToLesson(isThisLessonPlaying) {
        if (this.needLockLessonAsPaid) {
            let _currentLocation = window.location.pathname + window.location.search,
                _needLocation = '/' + this.props.courseUrl + '/' + this.props.lesson.URL

            if (_currentLocation !== _needLocation) {
                let _url = '/' + this.props.courseUrl + '/' + this.props.lesson.URL;

                history.push({pathname: _url})
            }
        } else {
            if (isThisLessonPlaying) {this._startPlay()} else {this._play()}
        }
    }

    _getButton(isThisLessonPlaying, isFinished) {
        const _play = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#play"/>',
            _replay = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#reload"/>',
            _crown = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#crown"/>',
            _lock = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#lock"/>'

        let {lesson, authorized, isPaidCourse,} = this.props,
            {IsAuthRequired} = lesson,
            _button = null;

        if (isPaidCourse && !lesson.IsFreeInPaidCourse) {
            return <button className="lecture__btn paused" onClick={() => {this._goToLesson(isThisLessonPlaying)}}>
                <svg width="27" height="30" dangerouslySetInnerHTML={{__html: _crown}}/>
            </button>
        } else if (IsAuthRequired && !authorized) {
            _button = <button className="lecture__btn paused" onClick={::this._unlock}>
                <svg width="27" height="30" dangerouslySetInnerHTML={{__html: _lock}}/>
            </button>
        } else {
            _button = (
                isFinished
                    ?
                    <button type="button" className="lecture__btn paused"
                            onClick={isThisLessonPlaying ? ::this._startPlay : ::this._play}>
                        <svg width="34" height="34" dangerouslySetInnerHTML={{__html: _replay}}/>
                    </button>
                    :
                    <button type="button" className="lecture__btn play"
                            onClick={isThisLessonPlaying ? ::this._startPlay : ::this._play}>
                        <svg width="41" height="36" dangerouslySetInnerHTML={{__html: _play}}/>
                    </button>
            )
        }

        return _button;
    }

    _getTooltip(isThisLessonPlaying, isFinished) {

        let {lesson, authorized, paused, isPaidCourse,} = this.props,
            {IsAuthRequired} = lesson,
            _tooltip = null;

        if (isPaidCourse && !lesson.IsFreeInPaidCourse) {
            _tooltip = TooltipTitles.IS_PAID
        } else if (IsAuthRequired && !authorized) {
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
        const _playSmall = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#play-small"/>',
            _pause = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#pause"/>',
            _radius = 97.75;

        let {playingLesson, paused, lesson, extClass, authorized} = this.props,
            {IsAuthRequired} = lesson,
            _lessonLocked = (IsAuthRequired && !authorized);

        let {isFinished: _isFinished, playedPart: _playedPart,} = this._calcLessonProps(lesson),
            _id = lesson.Id,
            _duration = lesson.DurationFmt,
            _fullLineLength = 2 * 3.14 * _radius,
            _timeLineLength = 2 * 3.14 * _playedPart * _radius,
            _offset = 2 * 3.14 * 0.25 * _radius;

        let _playingLessonId = playingLesson ? playingLesson.lessonId : 0,
            _isThisLessonPlaying = _playingLessonId === _id;

        let _tooltipText = this._getTooltip(_isThisLessonPlaying, _isFinished);

        return [
            <div className={"play-block" + (extClass ? ' ' + extClass : '')}>
                <div className="play-block__image-wrapper"
                     style={{backgroundImage: "url(" + '/data/' + this.props.cover + ")"}}/>
                {
                    !_lessonLocked ?
                        <div className="play-block__loader">
                            <svg className="svg-loader" width="200" height="200" viewBox="0 0 200 200"
                                 version="1.1" xmlns="http://www.w3.org/2000/svg">
                                <circle className="bar" id="bar01" r={_radius} cx="50%" cy="50%" fill="transparent"
                                        strokeDasharray={[_timeLineLength, _fullLineLength - _timeLineLength]}
                                        strokeDashoffset={_offset} style={{strokeWidth: '6px'}}/>
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
                            this._getButton(_isThisLessonPlaying, _isFinished)
                            :
                            <button className="lecture__btn paused"
                                    onClick={::this.props.playerStartActions.startPause}>
                                <svg width="23" height="36" dangerouslySetInnerHTML={{__html: _pause}}/>
                            </button>
                        :
                        this._getButton(_isThisLessonPlaying, _isFinished)
                }
                <div className="play-block__tooltip">{_tooltipText}</div>
                <div className="play-block__duration">{_duration}</div>
            </div>,

            <div className="play-block-mobile">
                <div className="play-block-mobile__play-block">
                    {
                        (_isThisLessonPlaying)
                            ?
                            (paused)
                                ?
                                <button type="button" className="play-btn-small"
                                        onClick={::this.props.playerStartActions.startPlay}>
                                    <svg width="12" height="11" dangerouslySetInnerHTML={{__html: _playSmall}}/>
                                    <span>Воспроизвести</span>
                                </button>
                                :
                                <button type="button" className="play-btn-small"
                                        onClick={::this.props.playerStartActions.startPause}>
                                    <svg width="12" height="11" dangerouslySetInnerHTML={{__html: _pause}}/>
                                    <span>Воспроизвести</span>
                                </button>
                            :
                            <button type="button" className="play-btn-small" onClick={::this._play}>
                                <svg width="12" height="11" dangerouslySetInnerHTML={{__html: _playSmall}}/>
                                <span>Воспроизвести</span>
                            </button>
                    }
                    <span className="play-block-mobile__duration">{_duration}</span>
                </div>
            </div>
        ]
    }

    _calcLessonProps(lesson) {
        let {lessonInfoStorage,} = this.props,
            {Id: id, Duration: totalDuration} = lesson;

        let _lessonInfo = lessonInfoStorage.lessons.get(id),
            _currentTime = _lessonInfo ? _lessonInfo.currentTime : 0;

        let _playedPart = totalDuration ? ((_currentTime) / totalDuration) : 0,
            _deltaTime = Math.round(totalDuration - _currentTime);

        let result = {};

        result.playedPart = _playedPart;
        result.isFinished = _lessonInfo ? (_lessonInfo.isFinished || (_deltaTime <= FINISH_DELTA_TIME)) : false;

        return result
    }

    get needLockLessonAsPaid() {
        return this.props.isPaidCourse && !(this.props.lesson.IsFreeInPaidCourse || this.props.isAdmin)
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
        userActions: bindActionCreators(userActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PlayBlock);