import React from 'react';
import PropTypes from 'prop-types';
import {Redirect} from 'react-router';

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import * as playerStartActions from '../../actions/player-start-actions'
import * as userActions from "../../actions/user-actions";
import $ from "jquery";

class PlayBlock extends React.Component {
    static propTypes = {
        cover: PropTypes.string,
        duration: PropTypes.string,
        courseUrl: PropTypes.string,
        lessonUrl: PropTypes.string,
        audios: PropTypes.array,
        isAuthRequired: PropTypes.bool,
        extClass: PropTypes.string,
    };

    constructor(props) {
        super(props)

        this._redirect = false
    }

    _play() {
        this.props.playerStartActions.preinitAudios(this.props.audios);
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

    _getButton(isThisLessonPlaying, isFinished) {
        const _play = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#play"/>',
            _replay = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#reload"/>',
            _lock = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#lock"/>'

        let {isAuthRequired, authorized} = this.props,
            _button = null;

        if (isAuthRequired && !authorized) {
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
                    <button type="button" className="lecture__btn"
                            onClick={isThisLessonPlaying ? ::this._startPlay : ::this._play}>
                        <svg width="41" height="36" dangerouslySetInnerHTML={{__html: _play}}/>
                    </button>
            )
        }

        return _button;
    }

    _getTooltip(isThisLessonPlaying, isFinished) {
        let {isAuthRequired, authorized, paused} = this.props,
            _tooltip = null;

        if (isAuthRequired && !authorized) {
            _tooltip = 'Для просмотра этой лекции необходимо авторизоваться на сайте'
        } else {
            _tooltip = isThisLessonPlaying ? (paused ? (isFinished ? "С начала" : "Смотреть") : 'Пауза') : (isFinished ? "С начала" : "Смотреть");
        }

        return _tooltip;
    }

    render() {
        const _playSmall = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#play-small"></use>',
            _pause = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#pause"/>',
            _radius = 97.75;

        let {id, totalDuration, playingLesson, paused, extClass} = this.props,
            _lessonInfo = this.props.lessonInfoStorage.lessons.get(id),
            _currentTime = _lessonInfo ? _lessonInfo.currentTime : 0,
            _isFinished = _lessonInfo ? _lessonInfo.isFinished : false,
            _playedPart = totalDuration ? ((_currentTime) / totalDuration) : 0,
            _fullLineLength = 2 * 3.14 * _radius,
            _timeLineLength = 2 * 3.14 * _playedPart * _radius,
            _offset = 2 * 3.14 * 0.25 * _radius;

        let _playingLessonId = playingLesson ? playingLesson.lessonId : 0,
            _isThisLessonPlaying = _playingLessonId === id;

        let _tooltipText = this._getTooltip(_isThisLessonPlaying, _isFinished);

        if (this._redirect) {
            this._redirect = false;
            return <Redirect push to={'/' + this.props.courseUrl + '/' + this.props.lessonUrl + '?play'}/>;
        }

        return (
            <div>
                <div className={"play-block" + (extClass ? ' ' + extClass : '')}>
                    <div className="play-block__image-wrapper"
                         style={{backgroundImage: "url(" + '/data/' + this.props.cover + ")"}}/>
                    <div className="play-block__loader">
                        <svg className="svg-loader" width="200" height="200" viewBox="0 0 200 200"
                             version="1.1" xmlns="http://www.w3.org/2000/svg">
                            <circle className="bar" id="bar01" r={_radius} cx="50%" cy="50%" fill="transparent"
                                    strokeDasharray={[_timeLineLength, _fullLineLength - _timeLineLength]}
                                    strokeDashoffset={_offset} style={{strokeWidth: '6px'}}/>
                        </svg>
                    </div>
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
                    <div className="play-block__tooltip">{_tooltipText}</div>
                    <div className="play-block__duration">{this.props.duration}</div>
                </div>

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
                        <span className="play-block-mobile__duration">{this.props.duration}</span>
                    </div>
                </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(PlayBlock);