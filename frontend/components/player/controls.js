import React from 'react';
import PropTypes from 'prop-types';
import $ from 'jquery'

export default class Controls extends React.Component {

    static propTypes = {
        handlePauseClick: PropTypes.func,
        handleBackwardClick: PropTypes.func,
        handleToggleMuteClick: PropTypes.func,
        handleSetVolume: PropTypes.func,
        pause: PropTypes.bool,
        muted: PropTypes.bool,
        volume: PropTypes.number
    };

    static defaultProps = {
        pause: false,
        muted: false
    };

    componentDidMount() {
        $("#sound-bar").click((event) => {
            let _current = event.pageX - event.currentTarget.offsetLeft,
                _total = event.currentTarget.offsetWidth - 1;
            this._setVolume(_current, _total)
        });
    }

    _onPause(e) {
        if (this.props.handlePauseClick) {
            this.props.handlePauseClick(e)
        }
    }

    _onBackward(e) {
        if (this.props.handleBackwardClick) {
            this.props.handleBackwardClick(e)
        }
    }

    _onToggleMute(e) {
        if (this.props.handleToggleMuteClick) {
            this.props.handleToggleMuteClick(e)
        }
    }

    _setVolume(current, total) {
        let value = total ? (current / total) : 0

        if (this.props.handleSetVolume) {
            this.props.handleSetVolume(value)
        }
    }

    render() {
        const _backwards = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#backward"/>',
            _pause = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#pause"/>',
            _play = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#play"/>',
            _sound = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#sound"/>',
            _mute = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#mute"/>';

        return (
            <div className="player-block__controls">
                <button type="button" className="backwards" onClick={::this._onBackward}>
                    <svg width="18" height="11" dangerouslySetInnerHTML={{__html: _backwards}}/>
                </button>
                {this.props.pause ?
                    <button type="button" className="play-button" onClick={::this._onPause}>
                        <svg className="play" width="19" height="19" dangerouslySetInnerHTML={{__html: _play}}/>
                    </button>
                    :
                    <button type="button" className="play-button" onClick={::this._onPause}>
                        <svg className="pause" width="11" height="18" dangerouslySetInnerHTML={{__html: _pause}}/>
                    </button>
                }
                <button type="button" className="sound-button" onClick={::this._onToggleMute}>

                    {
                        this.props.muted ?
                            <svg className="off" width="18" height="18" dangerouslySetInnerHTML={{__html: _mute}}/>
                            :
                            <svg className="on" width="18" height="18" dangerouslySetInnerHTML={{__html: _sound}}/>
                    }
                </button>
                <div className="sound-control" id='sound-bar' style={this.props.muted ? {display: 'none'} : null}>
                    <div className="sound-control__bar">
                        <div className="sound-control__progress" style={{width: (this.props.volume * 100) + "%"}}/>
                    </div>
                    <button type="button" className="sound-control__btn"
                            style={{left: (this.props.volume * 100) + "%"}}>Громкость
                    </button>
                </div>

            </div>
        );
    }
}