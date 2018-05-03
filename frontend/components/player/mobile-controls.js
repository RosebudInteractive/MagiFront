import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import $ from 'jquery'

import * as playerStartActions from '../../actions/player-start-actions'

class MobileControls extends React.Component {

    componentDidMount() {
        // $("#sound-bar").click((event) => {
        //     let _current = event.pageX - event.currentTarget.offsetLeft,
        //         _total = event.currentTarget.offsetWidth - 1;
        //     this._setVolume(_current, _total)
        // });
    }

    _onBackward() {
        let _newPosition = (this.props.currentTime < 10) ? 0 : (this.props.currentTime - 10);
        this.props.playerStartActions.startSetCurrentTime(_newPosition);
    }

    _setVolume(current, total) {
        let value = total ? (current / total) : 0
        this.props.playerStartActions.startSetVolume(value)
    }

    render() {
        const _backwards = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#backward"/>',
            _pause = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#pause"/>',
            // _play = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#play"/>',
            _sound = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#sound"/>',
            _mute = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#mute"/>';

        return (
            <div className="player-block__controls show">
                <button type="button" className="backwards">
                    <svg width="18" height="11">
                        <svg width="18" height="11" dangerouslySetInnerHTML={{__html: _backwards}}/>
                    </svg>
                </button>
                <button type="button" className="play-button">
                    <svg className="pause" width="11" height="18">
                        <svg width="18" height="11" dangerouslySetInnerHTML={{__html: _pause}}/>
                    </svg>
                </button>
                <button type="button" className="sound-button _sound-off">
                    <svg className="on" width="18" height="18">
                        <svg width="18" height="11" dangerouslySetInnerHTML={{__html: _sound}}/>
                    </svg>
                    <svg className="off" width="18" height="18">
                        <svg width="18" height="11" dangerouslySetInnerHTML={{__html: _mute}}/>
                    </svg>
                </button>
                <div className="sound-control">
                    <div className="sound-control__bar">
                        <div className="sound-control__progress" style={{width: "66%"}}></div>
                    </div>
                    <button type="button" className="sound-control__btn" style={{left: "66%"}}>Громкость</button>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        currentTime: state.player.currentTime,
        paused: state.player.paused,
        muted: state.player.muted,
        volume: state.player.volume,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        playerStartActions: bindActionCreators(playerStartActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MobileControls);