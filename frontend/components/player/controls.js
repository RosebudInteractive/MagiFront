import React from 'react';
import PropTypes from 'prop-types';

export default class Controls extends React.Component {

    static propTypes = {
        handlePauseClick: PropTypes.func,
        handleBackwardClick: PropTypes.func,
        pause: PropTypes.bool
    };

    static defaultProps = {};

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

    render() {
        const _backwards = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#backward"/>',
            _pause = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#pause"/>',
            _playSmall = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#play-small"/>',
            _sound = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#sound"/>';

        return (
            <div className="player-block__controls">
                <button type="button" className="backwards" onClick={::this._onBackward}>
                    <svg width="18" height="11" dangerouslySetInnerHTML={{__html: _backwards}}/>
                </button>
                <button type="button" className="play-button" onClick={::this._onPause}>
                    <svg className="pause" width="11" height="18" dangerouslySetInnerHTML={{__html: (this.props.pause ? _playSmall : _pause)}}/>
                </button>
                <button type="button" className="sound-button">
                    <svg width="18" height="18" dangerouslySetInnerHTML={{__html: _sound}}/>
                </button>
            </div>
        );
    }
}