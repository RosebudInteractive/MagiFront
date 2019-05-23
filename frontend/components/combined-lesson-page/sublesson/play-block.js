import React from 'react';
import PropTypes from 'prop-types';
import {Redirect} from 'react-router';

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import * as playerStartActions from '../../../actions/player-start-actions'
import $ from "jquery";
import {
    _calcLessonProps,
    _getTooltip,
    _goToLesson,
    _isLocationPlayerPage,
    _isPaidCourse,
    _unlock,
} from "../../common/small-play-block-functions";
import {getPaidCourseInfo,} from "ducks/billing";
import {SVG} from "../../common/play-block-functions";
import {unlockLesson} from "ducks/player";

class PlayBlock extends React.Component {
    static propTypes = {
        cover: PropTypes.string,
        lesson: PropTypes.object,
        course: PropTypes.object,
    };

    constructor(props) {
        super(props)

        this._redirect = false

        this._goToLesson = _goToLesson.bind(this)
        this._getTooltip = _getTooltip.bind(this)
        this._calcLessonProps = _calcLessonProps.bind(this)
        this._isLocationPlayerPage = _isLocationPlayerPage.bind(this)
        this._isPaidCourse = _isPaidCourse.bind(this)
        this._unlock = _unlock.bind(this)
    }

    _play() {
        let _audios = Object.values(this.props.lesson.Audios);

        this.props.playerStartActions.preinitAudios(_audios);
        this._redirect = true;
        this.forceUpdate()
        this.props.playerStartActions.startPlay(this.props.lesson.Id)
    }

    _startPlay() {
        if (this._isLocationPlayerPage()) {
            this.props.playerStartActions.startPlay(this.props.lesson.Id);
            let scrollTarget = $('.js-player').outerHeight() - $(window).height();
            $('html, body').animate({
                scrollTop: scrollTarget
            }, 600);
        } else {
            this._redirect = true;
            this.forceUpdate()
            this.props.playerStartActions.startPlay(this.props.lesson.Id);
        }
    }

    _getButton(isThisLessonPlaying, isFinished) {
        let {authorized, lesson,} = this.props,
            _isAuthRequired = lesson.IsAuthRequired,
            _button = null;

        if (this._isPaidCourse && !lesson.IsFreeInPaidCourse) {
            return <button className="lecture__btn paused" onClick={() => {this._goToLesson(isThisLessonPlaying)}}>
                <svg width="27" height="30" dangerouslySetInnerHTML={{__html: SVG.CROWN}}/>
            </button>
        } else if (_isAuthRequired && !authorized) {
            _button = <button className="lecture__btn paused" onClick={::this._unlock}>
                <svg width="27" height="30" dangerouslySetInnerHTML={{__html: SVG.LOCK}}/>
            </button>
        } else {
            _button = (
                isFinished
                    ?
                    <button type="button" className="lecture__btn paused"
                            onClick={isThisLessonPlaying ? ::this._startPlay : ::this._play}>
                        <svg width="34" height="34" dangerouslySetInnerHTML={{__html: SVG.REPLAY}}/>
                    </button>
                    :
                    <button type="button" className="lecture__btn"
                            onClick={isThisLessonPlaying ? ::this._startPlay : ::this._play}>
                        <svg width="41" height="36" dangerouslySetInnerHTML={{__html: SVG.PLAY}}/>
                    </button>
            )
        }

        return _button;
    }

    render() {
        const _pause = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#pause"/>',
            _radius = 97.75;

        let {playingLesson, paused, lesson, authorized} = this.props,
            {IsAuthRequired} = lesson,
            _lessonLocked = (IsAuthRequired && !authorized);


        let {isFinished: _isFinished, playedPart: _playedPart,} = this._calcLessonProps(lesson),
            _id = lesson.Id,
            _lessonUrl = lesson.URL,
            _courseUrl= lesson.courseUrl,
            _fullLineLength = 2 * 3.14 * _radius,
            _timeLineLength = 2 * 3.14 * _playedPart * _radius,
            _offset = 2 * 3.14 * 0.25 * _radius;

        let _playingLessonId = playingLesson ? playingLesson.lessonId : 0,
            _isThisLessonPlaying = _playingLessonId === _id;

        if (this._redirect) {
            this._redirect = false;
            return <Redirect push to={'/' + _courseUrl + '/' + _lessonUrl + '?play'}/>;
        }

        return (
            <div className="extras-list__play-btn sublesson__play-btn-big" type="button"
                    style={{backgroundImage: "url('/data/" + this.props.cover + "')"}}>
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
                            <button className="play-block__btn paused"
                                    onClick={::this.props.playerStartActions.startPause}>
                                <svg width="23" height="36" dangerouslySetInnerHTML={{__html: _pause}}/>
                            </button>
                        :
                        this._getButton(_isThisLessonPlaying, _isFinished)
                }
                <div className="lecture__tooltip">{this._getTooltip(_isThisLessonPlaying, _isFinished)}</div>
                <div className="play-block__red-shadow"/>
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

export default connect(mapStateToProps, mapDispatchToProps)(PlayBlock);