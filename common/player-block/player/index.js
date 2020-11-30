import React, {Component} from 'react';
import PropTypes from 'prop-types';

import $ from 'jquery'

// import FadeTimer from '../fade-timer';
// import {showFeedbackWindowSelector} from "ducks/message";
import {CONTENT_TYPE, PLAYER_CONTROLLER_MODE} from "../../constants/common-consts";
import {ExtLayer} from "./ext-layer";
import "./player.sass"

$.fn.isInViewport = function() {
    let _this = $(this);
    if (!_this || !_this.length) { return }

    let elementTop = _this.offset().top;
    let elementBottom = elementTop + _this.outerHeight();

    let viewportTop = $(window).scrollTop();
    let viewportBottom = viewportTop + $(window).height();

    return elementBottom > viewportTop && elementTop < viewportBottom;
};

export default class Frame extends Component {

    static propTypes = {
        lesson: PropTypes.object.isRequired,
        isMain: PropTypes.bool,

        playerController: PropTypes.object,
        visible: PropTypes.bool,
    };

    constructor(props) {
        super(props)
        this._lessonId = this.props.lesson.Id;

        // this._fadeTimer = new FadeTimer()
        this._playerInViewPort = false;

        this.state = {
            fullScreen: document.fullscreen,
            contentArray: [],
            currentContent: null,
            title: null,
            subTitle: null,
            bufferedTime: 0,
            currentTime: 0,
            showRateTooltip: props.playerController ? props.playerController.state.showRateTooltip : false,
            showContentTooltip:  props.playerController ? props.playerController.state.showContentTooltip : false,
            paused: props.playerController ? props.playerController.state.paused : false,
        }

        this._onDocumentReady = () => {
            // this._applyViewPort()
        }

        this._whitespacePressHandler = (e) => {
            if (e.which === 32) {
                this._onPause()
                e.preventDefault();
            }
        }

        this._resizeHandler = () => {
            let _isPlayerVisible = $('.js-player').isInViewport()
            if (this._playerInViewPort && !_isPlayerVisible) {
                // this._fadeTimer.stop()
            }

            if (!this._playerInViewPort && _isPlayerVisible) {
                // this._fadeTimer.start()
            }

            this._playerInViewPort = _isPlayerVisible;
        }

        this._onStateChanged = (state) => {
            if (this.state.showRateTooltip !== state.showRateTooltip) this.setState({showRateTooltip: state.showRateTooltip})
            if (this.state.showContentTooltip !== state.showContentTooltip) this.setState({showContentTooltip: state.showContentTooltip})
            if (this.state.paused !== state.paused) this.setState({paused: state.paused})
        }

        $(document).ready(this._onDocumentReady)
        $(window).on('resize scroll', ::this._resizeHandler)

    }

    componentDidMount() {
        let _player = $('.js-player');

        _player.on('mouseup', (e) => {
            let _isContent = e.target.closest('.js-contents'),
                _isRate = e.target.closest('.js-speed'),
                _isPlayer = e.target.closest('.ws-container') || e.target.closest('.player-frame__video-cap'),
                _isPauseFrame = e.target.closest('.js-pause-screen') && !e.target.closest('.lesson-tooltip') && !e.target.closest('.test-buttons-block'),
                _isMenuButton = e.target.closest('.menu-button');

            if (_isContent || _isRate || _isMenuButton) {
                return
            }

            if (_isPlayer || _isPauseFrame) {
                this._onPause()
            }

            if (_isPauseFrame) {
                // that.props.playerStartActions.startPlay(this.props.lesson.Id)
            }

            console.log(this.state)

            if (this.state.showRateTooltip && !e.target.closest('.js-speed-trigger')) {
                this.props.playerController.closeRateTooltip()
            }
            if (this.state.showContentTooltip && !e.target.closest('.js-contents-trigger')) {
                this.props.playerController.closeContentTooltip()
            }
        });

        $(document).bind('webkitfullscreenchange mozfullscreenchange fullscreenchange', () => {
            let _isFullScreen = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen;
            this.setState({fullScreen: _isFullScreen})
        });

        $(window).bind('keydown', this._whitespacePressHandler)

        _player.on('mousemove', () => {
            // this._fadeTimer.restart()
        });

        this.props.playerController.setFullViewPort($("#player" + this.props.lesson.Id))

        this.props.playerController.subscribe(this._onStateChanged)
    }

    componentDidUpdate(prevProps) {
        // if (!prevProps.showFeedbackWindow && this.props.showFeedbackWindow) {
        //     $(window).unbind('keydown', this._whitespacePressHandler)
        // }
        //
        // if (prevProps.showFeedbackWindow && !this.props.showFeedbackWindow) {
        //     $(window).bind('keydown', this._whitespacePressHandler)
        // }
        //
        //
        if (!prevProps.visible && this.props.visible) {
            this._applyViewPort()
        }
        //
        // if (!prevProps.paused && this.props.paused) {
        //     // this._fadeTimer.stop()
        // } else {
        //     if (prevProps.paused && !this.props.paused) {
        //         // this._fadeTimer.start();
        //     }
        // }
    }

    componentWillUnmount() {
        if (this.state.fullScreen) {
            this._toggleFullscreen()
        }

        this._removeListeners();
        // this._fadeTimer.stop()
        this._clearViewPort();
        this.props.playerController.unsubscribe(this._onStateChanged)
    }

    _applyViewPort() {
        if (this.props.playerController) {
            this.props.playerController.setFullViewPort($("#player" + this.props.lesson.Id))
            this.props.playerController.initPlay()
        }
    }

    _clearViewPort() {
        // let _id = this.props.lesson ? this.props.lesson.Id : '';
        // let _container = $('#player' + _id)
        //
        // if (_container.length) {
        //     // this.props.playerActions.clearFullViewPort(_container)
        // }
    }

    _removeListeners() {
        $('.js-player').unbind('mouseup');
        $('.js-player').unbind('mousemove');
        $(document).unbind('ready', this._onDocumentReady);
        $(window).unbind('resize scroll', this._resizeHandler);
        $(window).unbind('keydown', this._whitespacePressHandler)
    }

    _onPause() {
        if (this.state.paused) {
            this.props.playerController.requestPlay()
        }
        else {
            this.props.playerController.requestPause()
        }
    }

    // _toggleFullscreen() {
    //     let doc = window.document,
    //         docEl = doc.documentElement;
    //
    //     let requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen,
    //         cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
    //
    //     if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
    //         requestFullScreen.call(docEl);
    //     }
    //     else {
    //         cancelFullScreen.call(doc);
    //     }
    // }

    _pause() {
        if (this.props.playerController) {
            this.props.playerController.requestPause()
        }
    }

    _play() {
        if (this.props.playerController) {
            this.props.playerController.requestPlay()
        }
    }

    render() {
        let _id = this.props.lesson ? this.props.lesson.Id : ''

        if (this._lessonId !== _id) {
            return null
        }

        let { visible } = this.props

        const _isYoutubeVideo = this.props.lesson.ContentType === CONTENT_TYPE.VIDEO

        return <div className={"player-frame" + (!visible ? " _hidden" : "")}>
                <div className="player-frame__poster">
                    {_isYoutubeVideo ? <div className="player-frame__video-cap"/> : null}
                    <div className={'ws-container' + (_isYoutubeVideo ? " youtube" : "")} id={'player' + _id}/>
                </div>
                {
                    visible &&
                        <React.Fragment>
                            {this.state.paused && this.props.PauseScreen && <this.props.PauseScreen paused={this.state.paused} lesson={this.props.lesson}/>}
                            <ExtLayer id={_id} playerController={this.props.playerController}/>
                        </React.Fragment>
                }
            </div>
    }
}


Frame.propTypes = {
    lesson: PropTypes.object.isRequired,
    playerController: PropTypes.object,
}
