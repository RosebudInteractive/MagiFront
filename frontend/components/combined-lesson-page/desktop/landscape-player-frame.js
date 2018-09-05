import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import Progress from "../../player/progress";
import Controls from "./controls";
import ScreenControls from "./screen-controls";

import $ from 'jquery'
import Titles from "../../player/titles";
import TimeInfo from '../../player/time-info';
import ContentTooltip from "../../player/content-tooltip";
import RateTooltip from '../../player/rate-tooltip';

import * as playerActions from '../../../actions/player-actions'
import * as playerStartActions from '../../../actions/player-start-actions'

import FadeTimer from '../fade-timer';

$.fn.isInViewport = function() {
    var elementTop = $(this).offset().top;
    var elementBottom = elementTop + $(this).outerHeight();

    var viewportTop = $(window).scrollTop();
    var viewportBottom = viewportTop + $(window).height();

    return elementBottom > viewportTop && elementTop < viewportBottom;
};

class Frame extends Component {

    static propTypes = {
        lesson: PropTypes.object.isRequired,
        isMain: PropTypes.bool,
    };

    constructor(props) {
        super(props)
        this._lessonId = this.props.lesson.Id;

        this._fadeTimer = new FadeTimer()
        this._playerInViewPort = false;

        this.state = {
            fullScreen: document.fullscreen,
        }

        this._onDocumentReady = () => {
            this._applyViewPort()
        }

        this._resizeHandler = () => {
            let _isPlayerVisible = $('.js-player').isInViewport()
            if (this._playerInViewPort && !_isPlayerVisible) {
                this._fadeTimer.stop()
            }

            if (!this._playerInViewPort && _isPlayerVisible) {
                this._fadeTimer.start()
            }

            this._playerInViewPort = _isPlayerVisible;
        }

        $(document).ready(this._onDocumentReady)
        $(window).on('resize scroll', ::this._resizeHandler)
    }

    componentDidMount() {
        let that = this,
            _player = $('.js-player');

        _player.on('mouseup', (e) => {
            let _isContent = e.target.closest('.js-contents'),
                _isRate = e.target.closest('.js-speed'),
                _isPlayer = e.target.closest('.ws-container'),
                _isPauseFrame = e.target.closest('.player-frame__screen'),
                _isMenuButton = e.target.closest('.menu-button');

            if (_isContent || _isRate || _isMenuButton) {
                return
            }

            if (_isPlayer) {
                that.props.playerStartActions.startPause()
            }

            if (_isPauseFrame) {
                that.props.playerStartActions.startPlay(this.props.lesson.Id)
            }

            that._hideContentTooltip = that.props.showContentTooltip;
            that._hideRateTooltip = that.props.showSpeedTooltip;
            if (that._hideContentTooltip) {
                that.props.playerActions.hideContentTooltip()
            }
            if (that._hideRateTooltip) {
                that.props.playerActions.hideSpeedTooltip()
            }
        });

        $(document).bind('webkitfullscreenchange mozfullscreenchange fullscreenchange', () => {
            let _isFullScreen = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen;
            this.setState({fullScreen: _isFullScreen})
        });

        $(window).keydown((e) => {
            if (e.which === 32) {
                this._onPause()
                e.preventDefault();
            }
        })

        _player.on('mousemove', () => {
            this._fadeTimer.restart()
        });
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.visible && this.props.visible) {
            this._applyViewPort()
        } else {
            if (prevProps.visible && !this.props.visible) {
                this._viewPortApplied = false;
            }
        }

        if (!prevProps.paused && this.props.paused) {
            this._fadeTimer.stop()
        } else {
            if (prevProps.paused && !this.props.paused) {
                this._fadeTimer.start();
            }
        }
    }

    componentWillUnmount() {
        if (this.state.fullScreen) {
            this._toggleFullscreen()
        }

        this._removeListeners();
        this._fadeTimer.stop()
        this._clearViewPort();
    }

    _applyViewPort() {
        let _id = this.props.lesson ? this.props.lesson.Id : '';
        let _container = $('#player' + _id)
        this.props.playerActions.setFullViewPort(_container)
    }

    _clearViewPort() {
        let _id = this.props.lesson ? this.props.lesson.Id : '';
        let _container = $('#player' + _id)

        if (_container.length) {
            this.props.playerActions.clearFullViewPort(_container)
        }
    }

    _removeListeners() {
        $('.js-player').unbind('mouseup');
        $('.js-player').unbind('mousemove');
        $(document).off('keydown');
        $(document).unbind('ready', this._onDocumentReady);
        $(window).unbind('resize scroll', this._resizeHandler);
    }

    _openContent() {
        if (!this._hideContentTooltip) {
            this.props.playerActions.showContentTooltip()
        } else {
            this._hideContentTooltip = false
            this.props.playerActions.hideContentTooltip()
        }
    }

    _openRate() {
        if (!this._hideRateTooltip) {
            this.props.playerActions.showSpeedTooltip()
        } else {
            this._hideRateTooltip = false
            this.props.playerActions.hideSpeedTooltip()
        }
    }

    _onPause() {
        if (this.props.paused) {
            this.props.playerStartActions.startPlay(this.props.lesson.Id)
        }
        else {
            this.props.playerStartActions.startPause()
        }
    }

    _toggleFullscreen() {
        let doc = window.document,
            docEl = doc.documentElement;

        let requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen,
            cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

        if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
            requestFullScreen.call(docEl);
        }
        else {
            cancelFullScreen.call(doc);
        }
    }

    render() {
        let _id = this.props.lesson ? this.props.lesson.Id : '',
            {showContentTooltip, showSpeedTooltip} = this.props;

        if (this._lessonId !== _id) {
            return null
        }


        const _speed = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#speed"/>',
            _contents = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#contents"/>',
            _fullscreen = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#fullscreen"/>',
            _screen = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#screen"/>'

        let _lessonInfo = this.props.lessonInfoStorage.lessons.get(_id),
            _isFinished = _lessonInfo ? _lessonInfo.isFinished : false;

        let { visible, starting, paused, contentArray, } = this.props;

        return (
            <div style={visible ? null : {display: 'none'}}>
                <div className="player-frame__poster" style={_isFinished ? {display: 'none'} : null}>
                    <div className='ws-container' id={'player' + _id}>
                    </div>
                </div>
                {
                    visible ?
                        [
                            <div
                                className={"player-frame__screen" + (_isFinished ? " finished" : "") + (paused ? "" : " hide")}/>,
                            starting ? null : <ScreenControls {...this.props}/>,
                            <Titles/>,
                            <div className="player-frame">
                                <div className="player-block">
                                    <Progress id={_id}/>
                                    <div className="player-block__row">
                                        <Controls {...this.props}/>
                                        <div className="player-block__stats">
                                            <TimeInfo/>
                                            <button type="button"
                                                    className="speed-button js-speed-trigger player-button"
                                                    onClick={::this._openRate}>
                                                <svg width="18" height="18" dangerouslySetInnerHTML={{__html: _speed}}/>
                                            </button>
                                            {
                                                contentArray.length > 0 ?
                                                    <button type="button"
                                                            className="content-button js-contents-trigger player-button"
                                                            onClick={::this._openContent}>
                                                        <svg width="18" height="12"
                                                             dangerouslySetInnerHTML={{__html: _contents}}/>
                                                    </button>
                                                    :
                                                    null
                                            }
                                            <button type="button"
                                                    className={"fullscreen-button js-fullscreen" + (this.state.fullScreen ? ' active' : '')}
                                                    onClick={::this._toggleFullscreen}>
                                                <svg className="full" width="20" height="18"
                                                     dangerouslySetInnerHTML={{__html: _fullscreen}}/>
                                                <svg className="normal" width="20" height="18"
                                                     dangerouslySetInnerHTML={{__html: _screen}}/>
                                            </button>
                                        </div>
                                        {showContentTooltip ? <ContentTooltip id={_id}/> : ''}
                                        {showSpeedTooltip ? <RateTooltip/> : ''}
                                    </div>
                                </div>
                            </div>
                        ]
                        :
                        null
                }
            </div>
        )
    }
}


function mapStateToProps(state) {
    return {
        fetching: state.singleLesson.fetching,
        lessonInfo: state.singleLesson,
        course: state.singleLesson.course,
        lessons: state.lessons,
        contentArray: state.player.contentArray,
        paused: state.player.paused,
        starting: state.player.starting,
        showContentTooltip: state.player.showContentTooltip,
        showSpeedTooltip: state.player.showSpeedTooltip,
        isLessonMenuOpened: state.app.isLessonMenuOpened,
        lessonInfoStorage: state.lessonInfoStorage,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        playerActions: bindActionCreators(playerActions, dispatch),
        playerStartActions: bindActionCreators(playerStartActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Frame);