import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import Progress from "./progress";
import Controls from "./controls";
import ScreenControls from "../desktop/screen-controls";

import $ from 'jquery'
import Titles from "../../player/titles";
import TimeInfo from './time-info';
import ContentTooltip from "../../player/content-tooltip";
import RateTooltip from '../../player/rate-tooltip';

import YoutubePlayer from 'work-shop/youtube-player'
import Loader from "work-shop/resource-loader";
import {store} from "../../../store/configureStore";
import * as playerActions from "actions/player-actions";

class YoutubePage extends Component {

    static propTypes = {
        lesson: PropTypes.object.isRequired,
        isMain: PropTypes.bool,
    };

    constructor(props) {
        super(props)

        this.state = {
            time: 0,
            volume: 0,
            title: '',
            subtitle: '',
            buffered: 0,
            paused: true,
            totalDuration: 0,
            muted: false,
        }
    }

    componentDidMount() {
        new YoutubePlayer('YT-player', this._getPlayerOptions(), this._getAudioOptions())
    }

    _getPlayerOptions() {
        let that = this

        return {
            onReady: (player) => {
                that._player = player
                let _data = {}

                player.getDuration()
                    .then((data) => {
                        _data.totalDuration = data

                        return player.getMute()
                    })
                    .then((data) => {
                        _data.muted = data

                        that.setState(_data)
                    })
            },
            onCurrentTimeChanged: (data) => {
                that.setState({
                    time: data
                })
            },
            onVolumeChanged: (value) => {
                that.setState({volume: value / 100})
            },
            onChangeTitles: (titles) => {
                that.setState({
                    title: titles.title,
                    subtitle: titles.subtitle
                })
            },
            onChangeContent: () => {

            },
            onAudioInitialized: () => {

            },
            onPlaying: () => {
                that.setState({paused: false})
            },
            onPaused: () => {
                that.setState({paused: true})
            },
            onStarted: () => {
                that.setState({paused: false})
            },
            onEnded: () => {
                store.dispatch(playerActions.end())
            },
            onBuffered: (value) => {
                that.setState({buffered: value * this.state.totalDuration})
            },
            onError: (e) => {
                console.log(e)
            },
        };
    }

    _getAudioOptions() {
        return {
            videoId: '6qtkqvNzvbc'
        }
    }

    _seekTo(value) {
        this._player.setPosition(value)
    }

    _play() {
        this._player.play()
    }

    _pause() {
        this._player.pause()
    }

    _toggleMute() {
        this._player.toggleMute()
    }

    _setVolume(value) {
        this._player.setVolume(value * 100)
    }



    componentDidUpdate() {

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
        $(window).unbind('resize scroll', this._resizeHandler);
        $(window).unbind('keydown', this._whitespacePressHandler)
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
        // let _id = this.props.lesson ? this.props.lesson.Id : '',
        //     {showContentTooltip, showSpeedTooltip} = this.props;

        const _id = 1

        // if (this._lessonId !== _id) {
        //     return null
        // }

        const _invisibleStyle = {
            opacity: 0,
            zIndex: -100,
            visibility: "hidden"
        }

        const _speed = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#speed"/>',
            _contents = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#contents"/>',
            _fullscreen = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#fullscreen"/>',
            _screen = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#screen"/>'

        let _lessonInfo = {},
            _isFinished = _lessonInfo ? _lessonInfo.isFinished : false;

        let { starting, paused, canNotPlay} = this.props;

        const visible = true,
            contentArray = [],
            showContentTooltip = false,
            showSpeedTooltip = false

        return (
            <div style={visible ? null : _invisibleStyle}>
                <div className="player-frame__poster" style={{position: 'absolute', zIndex: 1}}>
                    <div className='ws-container' id={'YT-player'}>
                    </div>
                </div>
                {
                    visible ?
                        [
                            <div className={"player-frame__screen" + (_isFinished || canNotPlay ? " finished" : "") + (paused ? "" : " hide")}/>,
                            starting ? null : <ScreenControls {...this.props}/>,
                            <Titles/>,
                            <div className="player-frame" style={{position: 'absolute', zIndex: 2}}>
                                <div className="player-block">
                                    <Progress id={_id} onSetPosition={::this._seekTo} bufferedTime={this.state.buffered} contentArray={contentArray} currentTime={this.state.time} totalDuration={this.state.totalDuration}/>
                                    <div className="player-block__row">
                                        <Controls currentTime={this.state.time}
                                                  muted={this.state.muted}
                                                  paused={this.state.paused}
                                                  volume={this.state.volume}
                                                  startPause={::this._pause}
                                                  startPlay={::this._play}
                                                  toggleMute={::this._toggleMute}
                                                  startSetVolume={::this._setVolume}
                                                  startSetCurrentTime={::this._seekTo}
                                        />
                                        <div className="player-block__stats">
                                            <TimeInfo currentTime={this.state.time}
                                                      totalDuration={this.state.totalDuration}/>
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
        // fetching: state.singleLesson.fetching,
        // lessonInfo: state.singleLesson,
        // course: state.singleLesson.course,
        // lessons: state.lessons,
        // contentArray: state.player.contentArray,
        // paused: state.player.paused,
        // canNotPlay: state.player.canNotPlay,
        // starting: state.player.starting,
        // showContentTooltip: state.player.showContentTooltip,
        // showSpeedTooltip: state.player.showSpeedTooltip,
        // isLessonMenuOpened: state.app.isLessonMenuOpened,
        // lessonInfoStorage: state.lessonInfoStorage,
        // showFeedbackWindow: showFeedbackWindowSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        // playerActions: bindActionCreators(playerActions, dispatch),
        // playerStartActions: bindActionCreators(playerStartActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(YoutubePage);