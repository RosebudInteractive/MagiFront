import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {Redirect} from 'react-router';
import Swipeable from 'react-swipeable';
import $ from 'jquery'

import * as Player from '../components/player/nested-player';
// import 'script-lib/jquery.mobile-1.4.5.js';

export default class SmallPlayer extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            paused: false,
            isMobile: false,
            redirect: false,
        }

        this._listenerMounted = false;

        let that = this;
        this._handlePause = function () {
            that.setState({
                paused: this.audioState.stopped
            })
        }

        this._handlePlay = function () {
            that.setState({
                paused: this.audioState.stopped
            })
        }
    }

    static propTypes = {
        visible: PropTypes.bool.isRequired,
        lesson: PropTypes.object,
    };

    static defaultProps = {
        visible: false
    };

    componentDidUpdate(prevProps) {
        let _isMobile = ($(window).width() < 900);

        if (this.state.isMobile !== _isMobile) {
            this.setState({
                isMobile: _isMobile
            })
        }

        if (Player.getInstance() && (this.props.visible !== prevProps.visible)) {
            if (this.props.visible) {
                Player.getInstance().switchToSmall()
            }
        }

        this._mountPlayerListener();
    }

    componentWillUnmount() {
        let _player = Player.getInstance();

        if (this._listenerMounted && _player) {
            _player.removeListener('pause', this._handlePause);
            _player.removeListener('play', this._handlePlay);

            this._listenerMounted = false;
        }
    }

    _mountPlayerListener() {
        let _player = Player.getInstance();

        if ((!this._listenerMounted) && (_player)) {
            _player.addListener('pause', this._handlePause);
            _player.addListener('play', this._handlePlay);

            this._listenerMounted = true;
        }
    }

    _onPlayClick() {
        if (Player.getInstance()) {
            Player.getInstance().play()
        }

        this.setState({
            paused: false
        })
    }

    _onPauseClick() {
        if (Player.getInstance()) {
            Player.getInstance().pause()
        }
    }

    _onClick() {
        if (this.state.isMobile) {
            if (this.state.paused) {
                this._onPlayClick()
            } else {
                this._onPauseClick()
            }
        }
    }

    _close() {
        Player.getInstance().stop();
    }

    _maximize() {
        this.setState({redirect: true});
    }

    render() {
        if ((this.state.redirect) && (this.props.course) && (this.props.lesson)) {
            this.setState({redirect: false})
            return <Redirect push to={'/' + this.props.course.URL + '/' + this.props.lesson.URL + '?play'}/>;
        }

        const _pause = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#pause"/>',
            _play = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#play"/>',
            _maximize = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#maximize"/>',
            _close = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#close"/>';

        let _player = Player.getInstance(),
            _link = (_player && _player.lesson) ? '/' + _player.courseUrl + '/' + _player.lesson.URL + '?play' : '#',
            _text = (_player && _player.lesson) ?
                (_player.lesson.Number + '. ' + _player.lesson.Name)
                :
                null;

        let _stopped = Player.getInstance() ? Player.getInstance()._isHardStopped : false;

        return (
            <Swipeable trackMouse onSwipingRight={::this._close} onSwipedLeft={::this._maximize}>
                <div className={'small-player-frame' + ((this.props.visible && !_stopped) ? '' : ' hide')}
                     onClick={::this._onClick}>
                    <div className='ws-container-mini' id='small-player'/>
                    <div className='small-player__poster'/>
                    <div className='player-frame__poster-text'>{_text}</div>
                    {
                        _player ?
                            <div className='small-player_block'>
                                <Link to={_link}>
                                    <button type="button" className="maximize-button">
                                        <svg className="maximize" width="41" height="37"
                                             dangerouslySetInnerHTML={{__html: _maximize}}/>
                                    </button>
                                </Link>
                                {this.state.paused ?
                                    <button type="button" className="play-button" onClick={::this._onPlayClick}>
                                        <svg className="play" width="41" height="36"
                                             dangerouslySetInnerHTML={{__html: _play}}/>
                                    </button>
                                    :
                                    <button type="button" className="play-button" onClick={::this._onPauseClick}>
                                        <svg className="pause" width="23" height="36"
                                             dangerouslySetInnerHTML={{__html: _pause}}/>
                                    </button>
                                }
                                {
                                    <button type="button" className="close-button" onClick={::this._close}>
                                        <svg className="close" width="18" height="18"
                                             dangerouslySetInnerHTML={{__html: _close}}/>
                                    </button>
                                }
                            </div>
                            :
                            null
                    }
                </div>
            </Swipeable>
        );
    }
}


