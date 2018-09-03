import React from 'react';
import PropTypes from 'prop-types';
import {Redirect} from 'react-router';

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import * as playerStartActions from '../../../actions/player-start-actions'
import * as userActions from "../../../actions/user-actions";
import $ from "jquery";

class PlayBlock extends React.Component {
    static propTypes = {
        cover: PropTypes.string,
        lesson: PropTypes.object,
    };

    constructor(props) {
        super(props)

        this._redirect = false
    }

    _play() {
        let _audios = Object.values(this.props.lesson.Audios);

        this.props.playerStartActions.preinitAudios(_audios);
        this._redirect = true;
        this.forceUpdate()
        this.props.playerStartActions.startPlay(this.props.id)
    }

    _startPlay() {
        this.props.playerStartActions.startPlay(this.props.id);

        let scrollTarget = $('.js-player').outerHeight() - $(window).height();
        $('html, body').animate({
            scrollTop: scrollTarget
        }, 600);
    }

    _unlock() {
        this.props.userActions.showSignInForm();
    }

    _getSmallButton(isThisLessonPlaying, isFinished) {
        const _playSmall = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#play-small"></use>',
            _replaySmall = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#reload-small"/>'

        return isFinished
            ?
            <button type="button" className="lecture__btn paused"
                    onClick={isThisLessonPlaying ? ::this._startPlay : ::this._play}>
                <svg width="16" height="16" dangerouslySetInnerHTML={{__html: _replaySmall}}/>
            </button>
            :
            <button type="button" className="lecture__btn"
                    onClick={isThisLessonPlaying ? ::this._startPlay : ::this._play}>
                <svg width="12" height="11" dangerouslySetInnerHTML={{__html: _playSmall}}/>
            </button>


    }

    render() {
        const _playSmall = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#play-small"></use>',
            _radius = 86.75;

        let {playingLesson, paused, lesson} = this.props,
            _id = lesson.Id,
            _totalDuration = lesson.Duration,
            _duration = lesson.DurationFmt,
            _lessonUrl = lesson.URL,
            _courseUrl = lesson.courseUrl,
            _lessonInfo = this.props.lessonInfoStorage.lessons.get(_id),
            _currentTime = _lessonInfo ? _lessonInfo.currentTime : 0,
            _isFinished = _lessonInfo ? _lessonInfo.isFinished : false,
            _playedPart = _totalDuration ? ((_currentTime) / _totalDuration) : 0,
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
            <button className="extras-list__play-btn mobile" type="button">
                <div className="play-block__loader small">
                    <svg className="svg-loader" width="200" height="200" viewBox="0 0 200 200"
                         version="1.1" xmlns="http://www.w3.org/2000/svg">
                        <circle className="bar" id="bar01" r={_radius} cx="50%" cy="50%" fill="transparent"
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
                            <button className="play-block__btn paused"
                                    onClick={::this.props.playerStartActions.startPause}>
                                <svg width="8" height="10" dangerouslySetInnerHTML={{__html: _playSmall}}/>
                            </button>
                        :
                        this._getSmallButton(_isThisLessonPlaying, _isFinished)
                }
            </button>
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

export default connect(mapStateToProps, mapDispatchToProps)(PlayBlock);