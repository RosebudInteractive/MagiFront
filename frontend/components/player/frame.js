import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import Progress from "./progress";
import Controls from "./controls";

import $ from 'jquery'
// import 'script-lib/jquery.mCustomScrollbar.concat.min.js';
import PauseScreen from "./pause-screen";
import Titles from "./titles";
import TimeInfo from './time-info';
import ContentTooltip from "./content-tooltip";
import RateTooltip from './rate-tooltip';

import * as playerActions from '../../actions/player-actions'

class Frame extends Component {

    static propTypes = {
        lesson: PropTypes.object.isRequired,
        onLeavePage: PropTypes.func,
        isMain: PropTypes.bool,
    };

    constructor(props) {
        super(props)

        this.state = {
            showContent: false,
            showRate: false,
            fullScreen: false,
        }
    }


    componentDidMount() {
        let that = this;
        let tooltips = $('.js-speed, .js-contents, .js-share');

        $(document).mouseup(function (e) {
            let _needHide = false;
            if (tooltips.has(e.target).length === 0) {
                _needHide = _needHide || tooltips.hasClass('opened');
                if (_needHide) {
                    tooltips.removeClass('opened');
                }
            }

            that._hideAllTooltips = _needHide || that.state.showContent;
            if (that._hideAllTooltips) {
                that.setState({
                    showContent: false,
                    showRate: false,
                })
            }
        });

        $(document).bind('webkitfullscreenchange mozfullscreenchange fullscreenchange', () => {
            let _isFullScreen = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen;
            this.setState({fullScreen: _isFullScreen})
        });

        // $(document).keydown((e) => {
        //     if (e.which === 32) {
        //         that._onPause()
        //         e.preventDefault();
        //         return false
        //     }
        // })

        if (this.props.visible) {
            let _id = this.props.lesson ? this.props.lesson.Id : '';
            let _container = $('#player' + _id)
            this.props.playerActions.setFullViewPort(_container)
        }
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.visible && nextProps.visible) {
            let _id = this.props.lesson ? this.props.lesson.Id : '';
            let _container = $('#player' + _id)
            this.props.playerActions.setSmallViewPort(_container)
        }
    }

    componentWillUnmount() {
        if (this.state.fullScreen) {
            this._toggleFullscreen()
        }

        this._removeListeners();

        if (this.props.onLeavePage) {
            this.props.onLeavePage()
        }

    }

    _removeListeners() {
        $(document).off('mouseup');
        $(document).off('keyup');
    }

    _openContent() {
        if (!this._hideAllTooltips) {
            this.setState({showContent: !this.state.showContent})
        } else {
            this._hideAllTooltips = false
        }
    }

    _openRate() {
        if (!this._hideAllTooltips) {
            this.setState({showRate: !this.state.showRate})
        } else {
            this._hideAllTooltips = false
        }
    }

    _onPause() {
        // if (this.props.onPause && this.props.onPlay) {
        //     if (this.props.paused) {
        //         this.props.onPlay()
        //     }
        //     else {
        //         this.props.onPause();
        //     }
        //
        //     this.setState({
        //         pause: !this.state.pause
        //     })
        // }
    }

    _keyUpHandler(e) {
        if (e.which === 32) {
            this._onPause()

        }
        e.preventDefault();
    }

    _onScreenClick(e) {
        if (this._hasOrIs(e.target, 'player-frame__screen') || this._hasOrIs(e.target, 'ws-container')) {
            this._onPause()
        }

    }

    _hasOrIs(target, name) {
        if (target.className === name) {
            return true
        } else {
            return target.parentNode ? false : this._hasOrIs(target.parentNode, name)
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
            <div style={this.props.visible ? null : {display: 'none'}} onClick={::this._onScreenClick}
                 onKeyUp={this._handleKeyUp} ref="player">
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
                                            <button type="button" className="content-button js-contents-trigger"
                                                    onClick={::this._openContent}>
                                                <svg width="18" height="12" dangerouslySetInnerHTML={{__html: _contents}}/>
                                            </button>
                                            <button type="button"
                                                    className={"fullscreen-button js-fullscreen" + (this.state.fullScreen ? ' active' : '')}
                                                    onClick={::this._toggleFullscreen}>
                                                <svg className="full" width="20" height="18"
                                                     dangerouslySetInnerHTML={{__html: _fullscreen}}/>
                                                <svg className="normal" width="20" height="18"
                                                     dangerouslySetInnerHTML={{__html: _screen}}/>
                                            </button>
                                        </div>
                                        <ContentTooltip visible={this.state.showContent}
                                                        id={_id}/>
                                        <RateTooltip visible={this.state.showRate}/>
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
        fetching: state.singleLesson.fetching,
        lessonInfo: state.singleLesson,
        course: state.singleLesson.course,
        lessons: state.lessons,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        playerActions: bindActionCreators(playerActions, dispatch),
        // pageHeaderActions: bindActionCreators(pageHeaderActions, dispatch),
        // appActions: bindActionCreators(appActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Frame);