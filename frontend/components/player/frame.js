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

        this._timer = null;

        this.state = {
            showContent: false,
            showRate: false,
            fullScreen: false,
        }

        this._firstTap = false;
    }


    componentDidMount() {
        let that = this

        $(document).mouseup((e) => {
            let _isContent = e.target.closest('.js-contents'),
                _isRate = e.target.closest('.js-speed'),
                _isPlayer = e.target.closest('.ws-container'),
                _isPauseFrame = e.target.closest('.player-frame__screen');

            if (_isContent || _isRate) {
                return
            }

            if (_isPlayer) {
                if (that.props.isMobileApp && that._firstTap) {
                    this._firstTap = false;
                    that._clearTimeOut();
                    that._initTimeOut();
                } else {
                    that.props.playerStartActions.startPause()
                }

            }

            if (_isPauseFrame) {
                this.props.playerStartActions.startPlay()
            }

            this._hideContentTooltip = this.state.showContent;
            this._hideRateTooltip = this.state.showRate
            if (this._hideContentTooltip) {
                this.setState({showContent: false})
            }
            if (this._hideRateTooltip) {
                this.setState({showRate: false})
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

    _clearTimeOut(){
        $('body').removeClass('fade');
        if (this._timer) {
            clearTimeout(this._timer);
        }
    }

    _initTimeOut(){
        if (!this.props.paused) {
            this._timer = setTimeout(() => {
                this._firstTap = true;
                $('body').addClass('fade');
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
            this.setState({showContent: !this.state.showContent})
        } else {
            this._hideContentTooltip = false
        }
    }

    _openRate() {
        if (!this._hideRateTooltip) {
            this.setState({showRate: !this.state.showRate})
        } else {
            this._hideRateTooltip = false
        }
    }

    _onPause() {
        if (this.props.paused) {
            this.props.playerStartActions.startPlay()
        }
        else {
            this.props.playerStartActions.startPause()
        }
    }

    _toggleFullscreen() {
        if (!document.fullscreenElement &&    // alternative standard method
            !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {  // current working methods
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) {
                document.documentElement.msRequestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
    }


    render() {
        let _id = this.props.lesson ? this.props.lesson.Id : '';

        const
            _speed = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#speed"/>',
            _contents = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#contents"/>',
            _fullscreen = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#fullscreen"/>',
            _screen = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#screen"/>'

        return (
            <div style={this.props.visible ? null : {display: 'none'}} tabIndex="0">
                <div className="player-frame__poster" style={this.props.showCover ? {display: 'none'} : null}>
                    <div className='ws-container' id={'player' + _id}>
                    </div>
                </div>
                {
                    this.props.visible ?
                        <div>
                            <PauseScreen {...this.props}/>
                            <div className="player-frame">
                                <Titles/>
                                <div className="player-block">
                                    <Progress id={_id}/>
                                    <div className="player-block__row">
                                        <Controls/>
                                        <div className="player-block__stats">
                                            <TimeInfo/>
                                            <button type="button" className="speed-button js-speed-trigger"
                                                    onClick={::this._openRate}>
                                                <svg width="18" height="18" dangerouslySetInnerHTML={{__html: _speed}}/>
                                            </button>
                                            {
                                                this.props.contentArray.length > 0 ?
                                                    <button type="button" className="content-button js-contents-trigger"
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
                                        {this.state.showContent ? <ContentTooltip id={_id}/> : ''}
                                        {this.state.showRate ? <RateTooltip/> : ''}
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
    }
}

function mapDispatchToProps(dispatch) {
    return {
        playerActions: bindActionCreators(playerActions, dispatch),
        playerStartActions: bindActionCreators(playerStartActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Frame);