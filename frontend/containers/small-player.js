import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import $ from 'jquery'

import * as Player from '../components/player/nested-player';

export default class SmallPlayer extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            paused: false,
            isMobile: false,
        }
    }

    static propTypes = {
        visible: PropTypes.bool.isRequired,
        lesson: PropTypes.object,
    };

    static defaultProps = {
        visible: false
    };

    componentDidMount() {
        let that = this;

        $(".small-player-frame" ).on('swipe', that._swipeHandler);
    }

    _swipeHandler(event) {
        alert('swipe!' + event)
    }

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
    }

    _onPlayClick() {
        if (Player.getInstance()) {
            Player.getInstance().play()
        }

        this.setState({
            paused : false
        })
    }

    _onPauseClick() {
        if (Player.getInstance()) {
            Player.getInstance().pause()
        }

        this.setState({
            paused : true
        })
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

    render() {
        const _pause = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#pause"/>',
            _play = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#play"/>',
            _maximize = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#maximize"/>';

        let _player = Player.getInstance(),
            _link = _player ? '/play-lesson/' + _player.courseUrl + '/' + _player.lesson.URL : null,
            _text = (_player && _player.lesson) ?
                (_player.lesson.Number + '. ' + _player.lesson.Name)
                :
                null;

        let _paused = Player.getInstance() ? Player.getInstance().audioState.stopped : true;

        return (
            <div className='small-player-frame' style={this.props.visible ? {opacity: 1} : {opacity: 0}} onClick={::this._onClick}>
                <div className='small-player__poster'>
                    <div className='ws-container-mini' id='small-player'/>
                </div>
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
                            {_paused ?
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
                        </div>
                        :
                        null
                }

            </div>
        );
    }
}


