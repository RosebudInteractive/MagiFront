import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import Progress from "../player/progress";
import Controls from "./controls";

import $ from 'jquery'
import Titles from "../player/titles";
import TimeInfo from '../player/time-info';
import ContentTooltip from "../player/content-tooltip";
import RateTooltip from '../player/rate-tooltip';
import SoundButton from '../player-controls/sound-button'
import SoundBar from '../player-controls/sound-bar'

import * as playerActions from '../../actions/player-actions'
import * as playerStartActions from '../../actions/player-start-actions'

class Frame extends Component {

    static propTypes = {
        lesson: PropTypes.object.isRequired,
        isMain: PropTypes.bool,
    };

    constructor(props) {
        super(props)
        this._lessonId = this.props.lesson.Id;

        this._timer = null;

        this.state = {
            fullScreen: document.fullscreen,
        }

        this._firstTap = true;

        this._onDocumentReady = () => {
            this._applyViewPort()
        }

        this._resizeHandler = () => {
            let _width = $(window).innerWidth(),
                _height = $(window).innerHeight(),
                _control = $('.lesson-player');

            const _rate = 0.75

            if (_control.length > 0) {
                if ((_width * _rate) < _height) {
                    if (!_control.hasClass('added')) {
                        _control.toggleClass('added')
                    }
                } else {
                    _control.removeClass('added')
                }
            }
        }

        $(document).ready(this._onDocumentReady)
        $(window).resize(this._resizeHandler)
        this._touchEventName = this.props.isMobileApp ? 'touchend' : 'mouseup'
    }

    componentDidMount() {
        let that = this

        document.body.addEventListener(this._touchEventName, (e) => {
            let _isContent = e.target.closest('.js-contents'),
                _isRate = e.target.closest('.js-speed'),
                _isPlayer = e.target.closest('.ws-container'),
                _isPauseFrame = e.target.closest('.player-frame__screen'),
                _isMenuButton = e.target.closest('.menu-button');

            if (_isContent || _isRate || _isMenuButton) {
                return
            }

            if (_isPlayer) {
                if (that.props.isMobileApp && that._firstTap) {
                    that._firstTap = false;
                    that._clearTimeOut();
                    that._initTimeOut();
                } else {
                    that.props.playerStartActions.startPause()
                }
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

        $(document).on('mousemove', () => {
            this._clearTimeOut();
            this._initTimeOut();
        });

        this._resizeHandler();
    }

    _clearTimeOut() {
        $('.lecture-frame__play-block-wrapper').removeClass('fade');
        // $('.player-block__controls').addClass('show')
        if (this._timer) {
            clearTimeout(this._timer);
        }
    }

    _initTimeOut() {
        if (!this.props.paused) {
            this._timer = setTimeout(() => {
                if (!(this.state.showContent || this.state.showRate || this.props.isLessonMenuOpened)) {
                    this._firstTap = true;
                    $('.lecture-frame__play-block-wrapper').addClass('fade');
                    // $('.player-block__controls').removeClass('show')
                }
            }, 7000);
        } else {
            this._timer = null
        }
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
            this._clearTimeOut()
        } else {
            if (prevProps.paused && !this.props.paused) {
                this._initTimeOut();
            }
        }
    }

    componentWillUnmount() {
        if (this.state.fullScreen) {
            this._toggleFullscreen()
        }

        this._removeListeners();
        this._clearViewPort();
        this._clearTimeOut();
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
        $(document).off(this._touchEventName);
        $(document).off('keydown');
        $(document).off('mousemove');
        $(document).unbind('ready', this._onDocumentReady);
        $(window).unbind('resize', this._resizeHandler);
    }

    _openContent() {
        if (!this._hideContentTooltip) {
            this._clearTimeOut()
            this.props.playerActions.showContentTooltip()
        } else {
            this._hideContentTooltip = false
            this.props.playerActions.hideContentTooltip()
        }
    }

    _openRate() {
        if (!this._hideRateTooltip) {
            this._clearTimeOut()
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
            _contents = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#contents"/>'

        let _lessonInfo = this.props.lessonInfoStorage.lessons.get(_id),
            _isFinished = _lessonInfo ? _lessonInfo.isFinished : false

        return (
            <div style={this.props.visible ? null : {display: 'none'}}>
                <div className="player-frame__poster" style={_isFinished ? {display: 'none'} : null}>
                    <div className='ws-container' id={'player' + _id}>
                    </div>
                </div>
                {
                    this.props.visible ?
                        [
                            <div className={"player-frame__screen" + (_isFinished ? " finished" : "") + (this.props.paused ? "" : " hide")}/>,
                            <Controls {...this.props}/>,
                            <Titles/>,
                            <div className="player-block">
                                <Progress id={_id}/>
                                <div className="player-block__row">
                                    <div className="player-block__controls">
                                        <TimeInfo/>
                                    </div>
                                    <div className="player-block__stats">
                                        <SoundButton/>
                                        <SoundBar/>
                                        {
                                            this.props.contentArray.length > 0 ?
                                                <button type="button"
                                                        className="content-button js-contents-trigger player-button"
                                                        onClick={::this._openContent}>
                                                    <svg width="18" height="12"
                                                         dangerouslySetInnerHTML={{__html: _contents}}/>
                                                </button>
                                                :
                                                null
                                        }
                                        <button type="button" className="speed-button js-speed-trigger player-button"
                                                onClick={::this._openRate}>
                                            <svg width="18" height="18" dangerouslySetInnerHTML={{__html: _speed}}/>
                                        </button>
                                    </div>
                                    {showContentTooltip ? <ContentTooltip id={_id}/> : ''}
                                    {showSpeedTooltip ? <RateTooltip/> : ''}
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
        isMobileApp: state.app.isMobileApp,
        fetching: state.singleLesson.fetching,
        lessonInfo: state.singleLesson,
        course: state.singleLesson.course,
        lessons: state.lessons,
        contentArray: state.player.contentArray,
        paused: state.player.paused,
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