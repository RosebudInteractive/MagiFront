import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Progress from "./progress";
import Controls from "./controls";

import * as tools from '../../tools/time-tools'

import $ from 'jquery'
// import 'script-lib/jquery.mCustomScrollbar.concat.min.js';
import PauseScreen from "./pause-screen";
import ContentTooltip from "./content-tooltip";

export default class Frame extends Component {

    static propTypes = {
        lesson: PropTypes.object.isRequired,
        content: PropTypes.array,
        currentContent: PropTypes.number,
        onPause: PropTypes.func,
        onPlay: PropTypes.func,
        onSetRate: PropTypes.func,
        onMute: PropTypes.func,
        onUnmute: PropTypes.func,
        onGoToContent: PropTypes.func,
        onLeavePage: PropTypes.func,
        playTime: PropTypes.number.isRequired,
        isMain: PropTypes.bool,
        volume: PropTypes.number,
        paused: PropTypes.bool,
        mute: PropTypes.bool,
    };

    constructor(props) {
        super(props)

        this.state = {
            // pause: false,
            // muted: false,
            showContent: false,
            showRate: false,
            totalDurationFmt: '',
            totalDuration: 0,
            content: [],
            currentToc: 0,
            currentRate: 1,
            fullScreen: false,
        }

        this._scrollMounted = false;
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
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.content !== nextProps.content) {
            if (nextProps.content) {
                this._calcContent(nextProps.content)
            }

        }

        if ((nextProps.currentContent) && (this.state.currentToc !== nextProps.currentContent))  {
            this.setState({
                currentToc: nextProps.currentContent
            })
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

        // this._unmountCustomScroll();
    }

    // _unmountCustomScroll() {
    //     if (this._scrollMounted) {
    //         $(".scrollable").mCustomScrollbar('destroy');
    //         this._scrollMounted = false
    //     }
    // }

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



    _getRates() {
        let that = this;
        const _rates = [
            {value: 0.25}, // Todo : надо убрать 0.25
            {value: 0.5},
            {value: 0.75},
            {value: 1, title: 'Обычная'},
            {value: 1.25},
            {value: 1.5},
            {value: 2},
        ];

        return _rates.map((item, index) => {
            return <li className={(this.state.currentRate === item.value) ? 'active' : ''} key={index}
                       onClick={() => that._setRate(item.value)}>
                {item.title ? item.title : item.value}
            </li>
        })
    }

    _calcContent(content) {
        let length = 0;
        let _items = [];
        content.forEach((episodeContent) => {
            length += episodeContent.duration;

            episodeContent.content.forEach((item) => {
                _items.push({id: item.id, title: item.title, begin: item.begin, episodeTitle: episodeContent.title})
            })
        })

        let _total = tools.getTimeFmt(length);

        this.setState({
            totalDurationFmt: _total,
            totalDuration: length,
            content: _items,
        })
    }

    _goToContent(begin, index) {
        this.props.onGoToContent(begin)
        this.setState({
            currentToc: index,
        })
    }

    _onPause() {
        if (this.props.onPause && this.props.onPlay) {
            if (this.props.paused) {
                this.props.onPlay()
            }
            else {
                this.props.onPause();
            }

            this.setState({
                pause: !this.state.pause
            })
        }
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

    _onBackward() {
        let _newPosition = (this.props.playTime < 10) ? 0 : (this.props.playTime - 10);
        this.props.onGoToContent(_newPosition);
    }

    _setRate(value) {
        if (this.props.onSetRate) {
            this.props.onSetRate(value)
            this.setState({currentRate: value})
        }
    }

    _onSetCurrentPosition(value) {
        this.props.onGoToContent(value);
    }

    _onToggleMute() {
        if (this.props.muted) {
            if (this.props.onUnmute) {
                this.props.onUnmute()
            }
        } else {
            if (this.props.onMute) {
                this.props.onMute()
            }
        }
    }

    _onSetVolume(value) {
        if (this.props.onSetVolume) {
            this.setState({
                volume: value
            });
            this.props.onSetVolume(value)
        }
    }

    _getCurrentContent() {
        return this.state.content.find((item) => {
            return item.id === this.state.currentToc
        })
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
        let _playTimeFrm = tools.getTimeFmt(this.props.playTime)
        let _currentContent = this._getCurrentContent();
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
                            <PauseScreen onPlay={::this._onPause} {...this.props} currentToc={_currentContent}
                                         visible={this.props.paused}/>
                            <div className="player-frame">
                                {
                                    !this.props.paused ?
                                        <div className="player-frame__poster-text">
                                            <h2 className="player-frame__poster-title">{this.props.title}</h2>
                                            <p className="player-frame__poster-subtitle">{this.props.subTitle}</p>
                                        </div>
                                        :
                                        null
                                }
                                <div className="player-block">
                                    <Progress total={this.state.totalDuration} id={_id}
                                              content={this.state.content}/>
                                    <div className="player-block__row">
                                        <Controls pause={this.props.paused}
                                                  muted={this.props.muted}
                                                  volume={this.props.volume}
                                                  handlePauseClick={::this._onPause}
                                                  handleBackwardClick={::this._onBackward}
                                                  handleToggleMuteClick={::this._onToggleMute}
                                                  handleSetVolume={::this._onSetVolume}
                                        />
                                        <div className="player-block__stats">
                                            <div className="player-block__info">
                                                <span className="played-time">{_playTimeFrm}</span>
                                                <span className="divider">/</span>
                                                <span className="total-time">{this.state.totalDurationFmt ? this.state.totalDurationFmt : this.props.lesson.DurationFmt}</span>
                                            </div>
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
                                        <ContentTooltip content={this.state.content}
                                                        currentToc={this.state.currentToc}
                                                        visible={this.state.showContent}
                                                        onGoToContent={::this._goToContent}
                                                        id={_id}/>
                                        <div className={"speed-tooltip js-player-tooltip js-speed" + (this.state.showRate ? ' opened' : '')}>
                                            <header className="speed-tooltip__header">
                                                <p className="speed-tooltip__title">Скорость</p>
                                            </header>
                                            <ul className="speed-tooltip__body">
                                                {this._getRates()}
                                            </ul>
                                        </div>
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