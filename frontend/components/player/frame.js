import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import Progress from "./progress";
import Controls from "./controls";

import $ from 'jquery'
import PauseScreen from "./pause-screen";
import Titles from "./titles";
import TimeInfo from './time-info';
import ContentTooltip from "./content-tooltip";
import RateTooltip from './rate-tooltip';

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
    }


    componentDidMount() {
        let that = this

        $(document).mouseup((e) => {
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

        // let that = this;
        //
        $(document).on('mousemove', () => {
            this._clearTimeOut();
            this._initTimeOut();
        });

        if (this.props.visible) {
            this._applyViewPort()
        }
    }

    _clearTimeOut() {
        $('body').removeClass('fade');
        $('.player-block__controls').addClass('show')
        if (this._timer) {
            clearTimeout(this._timer);
        }
    }

    _initTimeOut() {
        if (!this.props.paused) {
            this._timer = setTimeout(() => {
                if (!(this.state.showContent || this.state.showRate || this.props.isLessonMenuOpened)) {
                    this._firstTap = true;
                    $('body').addClass('fade');
                    $('.player-block__controls').removeClass('show')
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
        this._clearTimeOut();
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
        $(document).off('mouseup');
        $(document).off('keydown');
        $(document).off('mousemove');
    }

    _openContent() {
        if (!this._hideContentTooltip) {
            $('#fp-nav').addClass('hide');
            this._clearTimeOut()
            this.props.playerActions.showContentTooltip()
        } else {
            this._hideContentTooltip = false
            $('#fp-nav').removeClass('hide');
            this.props.playerActions.hideContentTooltip()
        }
    }

    _openRate() {
        if (!this._hideRateTooltip) {
            $('#fp-nav').addClass('hide');
            this._clearTimeOut()
            this.props.playerActions.showSpeedTooltip()
        } else {
            this._hideRateTooltip = false
            $('#fp-nav').removeClass('hide');
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

        if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
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
            _isFinished = _lessonInfo ? _lessonInfo.isFinished : false

        return (
            <div style={this.props.visible ? null : {display: 'none'}}>
                <div className="player-frame__poster" style={_isFinished ? {display: 'none'} : null}>
                    <div className='ws-container' id={'player' + _id}>
                    </div>
                </div>
                {
                    this.props.visible ?
                        <div>
                            <PauseScreen {...this.props} isFinished={_isFinished}/>
                            <div className="player-frame">
                                <Titles/>
                                <div className="player-block">
                                    <Progress id={_id}/>
                                    <div className="player-block__row">
                                        <Controls {...this.props}/>
                                        <div className="player-block__stats">
                                            <TimeInfo/>
                                            <button type="button" className="speed-button js-speed-trigger player-button"
                                                    onClick={::this._openRate}>
                                                <svg width="18" height="18" dangerouslySetInnerHTML={{__html: _speed}}/>
                                            </button>
                                            {
                                                this.props.contentArray.length > 0 ?
                                                    <button type="button" className="content-button js-contents-trigger player-button"
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
                        </div>
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