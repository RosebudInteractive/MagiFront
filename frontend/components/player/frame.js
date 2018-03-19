import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Progress from "./progress";
import Controls from "./controls";

import * as tools from '../../tools/time-tools'

import $ from 'jquery'
import PauseScreen from "./pause-screen";

export default class Frame extends Component {

    static propTypes = {
        lesson: PropTypes.object.isRequired,
        content: PropTypes.array.isRequired,
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
    }

    componentWillUnmount() {
        if (this.state.fullScreen) {
            this._toggleFullscreen()
        }

        if (this.props.onLeavePage) {
            this.props.onLeavePage()
        }
    }

    componentDidMount() {
        let tooltips = $('.js-speed, .js-contents, .js-share');
        $(document).mouseup(function (e) {
            if (tooltips.has(e.target).length === 0) {
                tooltips.removeClass('opened');
            }
        });

        $(document).bind('webkitfullscreenchange mozfullscreenchange fullscreenchange', () => {
            let _isFullScreen = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen;
            this.setState({fullScreen : _isFullScreen})
        });
    }


    _openContent() {
        this.setState({showContent: !this.state.showContent})
    }

    _openRate() {
        this.setState({showRate: !this.state.showRate})
    }

    _getContent() {
        let that = this;

        return this.state.content.map((item, index) => {
            return <li className={(this.state.currentToc === item.id) ? 'active' : ''} key={index}
                       onClick={() => that._goToContent(item.begin, item.id)}>
                <a href='#'>{item.title}</a>
            </li>
        })
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

    componentWillReceiveProps(nextProps) {
        if (this.props.content !== nextProps.content) {
            this._calcContent(nextProps.content)
        }

        if (this.state.currentToc !== nextProps.currentContent) {
            this.setState({
                currentToc: nextProps.currentContent
            })
        }
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
            !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods
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

        const
            _speed = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#speed"/>',
            _contents = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#contents"/>',
            _fullscreen = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#fullscreen"/>',
            _screen = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#screen"/>'

        return (
            <div>
                <div className="player-frame__poster">
                    <div className='ws-container' id='player'>
                    </div>
                </div>
                {this.props.paused ? <PauseScreen onPlay={::this._onPause} {...this.props} currentToc={_currentContent}/> : null}
                <div className="player-frame">
                    {
                        !this.props.paused ?
                            <div className="player-frame__poster-text">
                                <h2 className="player-frame__poster-title">{_currentContent ? _currentContent.episodeTitle : null}</h2>
                                <p className="player-frame__poster-subtitle">{_currentContent ? _currentContent.title : null}</p>
                            </div>
                            :
                            null
                    }
                    <div className="player-block">
                        <Progress total={this.state.totalDuration} current={this.props.playTime}
                                  content={this.state.content} onSetCurrentPosition={::this._onSetCurrentPosition}/>
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
                                    <span className="total-time">{this.state.totalDurationFmt}</span>
                                </div>
                                <button type="button" className="speed-button js-speed-trigger"
                                        onClick={::this._openRate}>
                                    <svg width="18" height="18" dangerouslySetInnerHTML={{__html: _speed}}/>
                                </button>
                                <button type="button" className="content-button js-contents-trigger"
                                        onClick={::this._openContent}>
                                    <svg width="18" height="12" dangerouslySetInnerHTML={{__html: _contents}}/>
                                </button>
                                <button type="button" className={"fullscreen-button js-fullscreen" + (this.state.fullScreen ? ' active' : '')} onClick={::this._toggleFullscreen}>
                                    <svg className="full" width="20" height="18"
                                         dangerouslySetInnerHTML={{__html: _fullscreen}}/>
                                    <svg className="normal" width="20" height="18"
                                         dangerouslySetInnerHTML={{__html: _screen}}/>
                                </button>
                            </div>
                            <div
                                className={"contents-tooltip js-player-tooltip js-contents scrollable" + (this.state.showContent ? ' opened' : '')}>
                                <header className="contents-tooltip__header">
                                    <p className="contents-tooltip__title">Оглавление</p>
                                </header>
                                <ol className="contents-tooltip__body scrollable mCustomScrollbar _mCS_2">
                                    <div id="mCSB_2" className="mCustomScrollBox mCS-light mCSB_vertical mCSB_inside"
                                         tabIndex="0" style={{maxHeight: "none"}}>
                                        <div id="mCSB_2_container" className="mCSB_container"
                                             style={{position: "relative", top: 0, left: 0}} dir="ltr">
                                            {this._getContent()}
                                        </div>
                                        <div id="mCSB_2_scrollbar_vertical"
                                             className="mCSB_scrollTools mCSB_2_scrollbar mCS-light mCSB_scrollTools_vertical"
                                             style={{display: "block"}}>
                                            <div className="mCSB_draggerContainer">
                                                <div id="mCSB_2_dragger_vertical" className="mCSB_dragger"
                                                     style={{position: "absolute", minHeight: 30, display: "block", height: 159, maxHeight: 300, top: 0}}>
                                                    <div className="mCSB_dragger_bar" style={{lineHeight: 30}}/>
                                                </div>
                                                <div className="mCSB_draggerRail"/>
                                            </div>
                                        </div>
                                    </div>
                                </ol>
                            </div>
                            <div
                                className={"speed-tooltip js-player-tooltip js-speed" + (this.state.showRate ? ' opened' : '')}>
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
        )
    }
}