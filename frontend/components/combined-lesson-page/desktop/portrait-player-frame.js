import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import Progress from "../../player/progress";
import Controls from "../desktop/bottom-controls";

import Titles from "../../player/titles";
import TimeInfo from '../../player/time-info';
import ContentTooltip from "../../player/content-tooltip";
import RateTooltip from '../../player/rate-tooltip';

import * as playerActions from '../../../actions/player-actions'
import * as playerStartActions from '../../../actions/player-start-actions'

import $ from 'jquery'
import FadeTimer from '../fade-timer';
import {CONTENT_TYPE} from "../../../constants/common-consts";
import PauseScreen from "../player/pause-screen";

class PlayerFrame extends Component {

    static propTypes = {
        lesson: PropTypes.object.isRequired,
        isMain: PropTypes.bool,
    };

    constructor(props) {
        super(props)
        this._lessonId = this.props.lesson.Id;

        this.state = {
            fullScreen: document.fullscreen,
        }

        this._fadeTimer = new FadeTimer()

        this._onDocumentReady = () => {
            this._applyViewPort()
        }

        $(document).ready(this._onDocumentReady)
    }

    componentDidMount() {
        let that = this,
            _player = $('.js-player');


        _player.on('mouseup', (e) => {
            let _isContent = e.target.closest('.js-contents'),
                _isRate = e.target.closest('.js-speed'),
                _isPlayer = e.target.closest('.ws-container') || e.target.closest('.lecture-frame__play-block-wrapper') || e.target.closest('.player-frame__video-cap'),
                _isPauseFrame = e.target.closest('.player-frame__screen') || e.target.closest('.lecture-frame__play-block-wrapper');

            if (_isContent || _isRate) {
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
        })

        _player.on('mousemove', () => {
            this._fadeTimer.restart()
        });

        $(window).keydown((e) => {
            if (e.which === 32) {
                this._onPause()
                e.preventDefault();
            }
        })
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
        $(document).unbind('ready', this._onDocumentReady);
        $(window).unbind('keydown');
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
            _coverStyle = {
                backgroundImage : "url(" + '/data/' + this.props.lesson.Cover + ")",
                backgroundSize :  "cover",
                backgroundPosition : "top center",
            },
            _invisibleStyle = {
                opacity: 0,
                zIndex: -100,
                display: "contents",
                visibility: "hidden",
            }


        let _lessonInfo = this.props.lessonInfoStorage.lessons.get(_id),
            _isFinished = _lessonInfo ? _lessonInfo.isFinished : false;

        let {visible, paused, contentArray, canNotPlay, } = this.props;

        const _isYoutubeVideo = this.props.lesson.ContentType === CONTENT_TYPE.VIDEO

        return (
            <div style={visible ? null : _invisibleStyle}>
                <div className="player-frame__poster" style={_isFinished || canNotPlay ? _coverStyle : null}>
                    {_isYoutubeVideo ? <div className="player-frame__video-cap"/> : null}
                    <div className='ws-container' id={'player' + _id} style={_isFinished || canNotPlay? {visibility: 'hidden'} : null}>
                    </div>
                </div>
                {
                    visible &&
                        <React.Fragment>
                            <PauseScreen finished={_isFinished || canNotPlay} paused={paused} lesson={this.props.lesson}/>
                            <Titles/>
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
                                        </div>
                                        { showContentTooltip && <ContentTooltip id={_id}/> }
                                        { showSpeedTooltip && <RateTooltip/> }
                                    </div>
                                </div>
                            </div>
                        </React.Fragment>
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
        canNotPlay: state.player.canNotPlay,
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