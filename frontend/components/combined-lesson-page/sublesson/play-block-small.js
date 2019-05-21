import React from 'react';
import PropTypes from 'prop-types';
import {Redirect} from 'react-router';

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import * as playerStartActions from '../../../actions/player-start-actions'
import * as userActions from "../../../actions/user-actions";
import $ from "jquery";
import {getPaidCourseInfo,} from "ducks/billing";
import {
    _calcLessonProps,
    _getTooltip,
    _goToLesson,
    _isLocationPlayerPage,
    _isPaidCourse, SMALL_SVG
} from "../../common/small-play-block-functions";

class PlayBlock extends React.Component {
    static propTypes = {
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

    _unlock() {
        this.props.userActions.showSignInForm();
    }

    _getSmallButton(isThisLessonPlaying, isFinished) {
        let {lesson, authorized,} = this.props,
            {IsAuthRequired} = lesson,
            _button = null;

        if (this._isPaidCourse() && !lesson.IsFreeInPaidCourse) {
            return <button className="extras-list__play-btn mobile play-btn-small_locked paused" onClick={() => {this._goToLesson(isThisLessonPlaying)}}>
                <svg width="14" height="15" fill={"#fff"} dangerouslySetInnerHTML={{__html: SMALL_SVG.CROWN}}/>
            </button>
        } else if (IsAuthRequired && !authorized) {
            _button = <button className="extras-list__play-btn mobile play-btn-small_locked paused" onClick={::this._unlock}>
                <svg width="14" height="15" dangerouslySetInnerHTML={{__html: SMALL_SVG.LOCK}}/>
            </button>
        } else {
            _button = isFinished
                ?
                <button type="button" className="extras-list__play-btn mobile paused"
                        onClick={isThisLessonPlaying ? ::this._startPlay : ::this._play}>
                    <svg width="16" height="11" dangerouslySetInnerHTML={{__html: SMALL_SVG.REPLAY}}/>
                </button>
                :
                <button type="button" className="extras-list__play-btn mobile"
                        onClick={isThisLessonPlaying ? ::this._startPlay : ::this._play}>
                    <svg width="12" height="11" dangerouslySetInnerHTML={{__html: SMALL_SVG.PLAY}}/>
                </button>
        }

        return _button;
    }

    render() {
        const _playSmall = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#play-small"/>',
            _radius = 86.75;

        let {playingLesson, paused, lesson, authorized} = this.props,
            {IsAuthRequired} = lesson,
            _lessonLocked = (IsAuthRequired && !authorized);

        let {isFinished: _isFinished, playedPart: _playedPart,} = this._calcLessonProps(lesson),
            _id = lesson.Id,
            _lessonUrl = lesson.URL,
            _courseUrl = lesson.courseUrl,
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
            <div className="sublesson__play-block__wrapper">
                { !_lessonLocked ?
                    <div className="play-block-small">
                        <svg className="svg-loader" width="200" height="200" viewBox="0 0 200 200"
                             version="1.1" xmlns="http://www.w3.org/2000/svg">
                            <circle className="bar" id="bar01" r={_radius} cx="50%" cy="50%" fill="transparent"
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
                            <button className="extras-list__play-btn paused"
                                    onClick={::this.props.playerStartActions.startPause}>
                                <svg width="8" height="10" dangerouslySetInnerHTML={{__html: _playSmall}}/>
                            </button>
                        :
                        this._getSmallButton(_isThisLessonPlaying, _isFinished)
                }
                <div className="lecture__tooltip">{this._getTooltip(_isThisLessonPlaying, _isFinished)}</div>
            </div>
        )
    }
}

function

mapStateToProps(state) {
    return {
        lessonInfoStorage: state.lessonInfoStorage,
        paused: state.player.paused,
        playingLesson: state.player.playingLesson,
        authorized: !!state.user.user,
        isAdmin: !!state.user.user && state.user.user.isAdmin,
    }
}

function

mapDispatchToProps(dispatch) {
    return {
        playerStartActions: bindActionCreators(playerStartActions, dispatch),
        userActions: bindActionCreators(userActions, dispatch),
        getPaidCourseInfo: bindActionCreators(getPaidCourseInfo, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PlayBlock);