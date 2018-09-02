import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import Progress from "../../player/progress";
import ScreenControls from "./screen-controls";
import Controls from "../desktop/bottom-controls";

import Titles from "../../player/titles";
import TimeInfo from '../../player/time-info';
import ContentTooltip from "../../player/content-tooltip";
import RateTooltip from '../../player/rate-tooltip';
import SoundButton from '../../player-controls/sound-button'
import SoundBar from '../../player-controls/sound-bar'

import * as playerActions from '../../../actions/player-actions'
import * as playerStartActions from '../../../actions/player-start-actions'

import $ from 'jquery'
import {isLandscape} from "./tools";

class PlayerFrame extends Component {

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
        this._touchMoved = false;
        this._firstHide = true;

        this._onDocumentReady = () => {
            this._applyViewPort()
        }

        $(document).ready(this._onDocumentReady)
        this._touchEventName = this.props.isMobileApp ? 'touchend' : 'mouseup'
    }

    componentDidMount() {
        let that = this,
            _player = $('.js-player');


        _player.on(this._touchEventName, (e) => {
            if (this._touchMoved) {
                return
            }

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
        }).on('touchmove', () =>{
            this._touchMoved = true;
        }).on('touchstart', () => {
            this._touchMoved = false;
        });

        $(window).keydown((e) => {
            if (e.which === 32) {
                this._onPause()
                e.preventDefault();
            }
        })

        if (!this.props.isMobileApp) {
            $(document).on('mousemove', () => {
                this._clearTimeOut();
                this._initTimeOut();
            });
        }

        this._resizeHandler = () => {
            if (isLandscape()) {
                this._initTimeOut();
                this._hideScreenControls();
            } else {
                this._showButtomControls()
            }

        }

        if (this.props.isMobileApp) {
            $(window).resize(this._resizeHandler)
        }
    }

    _clearTimeOut() {
        $('.lecture-frame__play-block-wrapper').removeClass('fade');
        this._showButtomControls()
        if (this._timer) {
            clearTimeout(this._timer);
        }
    }

    _showButtomControls() {
        $('.player-block').removeClass('hide');
        $('.player-frame__poster-text').removeClass('low');
    }

    _initTimeOut() {
        if (!this.props.paused) {
            this._timer = setTimeout(::this._hideScreenControls, 7000);
        } else {
            this._timer = null
        }
    }

    _hideScreenControls() {
        // if (!(this.state.showContent || this.state.showRate || this.props.isLessonMenuOpened)) {
            this._firstTap = true;
            $('.lecture-frame__play-block-wrapper').addClass('fade');
            if (isLandscape()) {
                if (!this._firstHide) {
                    $('.player-block').addClass('hide');
                    $('.player-frame__poster-text').addClass('low');
                }  else {
                    this._firstHide = false;
                }
            }
        // }
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
                this._hideScreenControls();
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
        $('.js-player').unbind(this._touchEventName);
        $(document).off('keydown');
        $(document).off('mousemove');
        $(document).unbind('ready', this._onDocumentReady);
        if (this.props.isMobileApp) {
            $(window).unbind('resize', this._resizeHandler);
        }
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
                <div className="player-frame__poster" style={_isFinished ? {visibility: 'hidden'} : null}>
                    <div className='ws-container' id={'player' + _id}>
                    </div>
                </div>
                {
                    this.props.visible ?
                        [
                            <div
                                className={"player-frame__screen" + (_isFinished ? " finished" : "") + (this.props.paused ? "" : " hide")}/>,
                            <ScreenControls {...this.props}/>,
                            <Titles/>,
                            this.props.isMobileControls ?
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
                                            <button type="button"
                                                    className="speed-button js-speed-trigger player-button"
                                                    onClick={::this._openRate}>
                                                <svg width="18" height="18" dangerouslySetInnerHTML={{__html: _speed}}/>
                                            </button>
                                        </div>
                                        {showContentTooltip ? <ContentTooltip id={_id}/> : ''}
                                        {showSpeedTooltip ? <RateTooltip/> : ''}
                                    </div>
                                </div>
                                :
                                <div className="player-frame">
                                    <div className="player-block desktop">
                                        <Progress id={_id}/>
                                        <div className="player-block__row desktop">
                                            <Controls {...this.props}/>
                                            <div className="player-block__stats">
                                                <TimeInfo/>
                                                <button type="button"
                                                        className="speed-button js-speed-trigger player-button"
                                                        onClick={::this._openRate}>
                                                    <svg width="18" height="18"
                                                         dangerouslySetInnerHTML={{__html: _speed}}/>
                                                </button>
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

export default connect(mapStateToProps, mapDispatchToProps)(PlayerFrame);