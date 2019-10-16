import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import * as playerStartActions from '../../actions/player-start-actions'
import $ from "jquery";
import {isMobileAppleDevice} from "tools/page-tools";

class SoundBar extends React.Component {

    constructor(props) {
        super(props);

        this._clickHandler = (event) => {
            let _current = event.offsetX,
                _total = event.currentTarget.offsetWidth;
            this._setVolume(_current, _total)
        }
    }

    componentDidMount() {
        let _id = this.props.lesson ? this.props.lesson.Id : '';
        $("#sound-bar" + _id).click(this._clickHandler);
    }

    componentWillUnmount() {
        this._removeListeners();
    }

    _removeListeners() {
        let _id = this.props.lesson ? this.props.lesson.Id : '';
        $("#sound-bar" + _id).unbind('click', this._clickHandler);
    }

    _setVolume(current, total) {
        let value = total ? (current / total) : 0
        this.props.playerStartActions.startSetVolume(value)
    }

    render() {
        let _id = this.props.lesson ? this.props.lesson.Id : '',
            _isIOS = isMobileAppleDevice(),
            _needHideSoundControl = (this.props.muted || _isIOS)

        return (
            <div className="sound-control" id={'sound-bar' + _id}
                 style={_needHideSoundControl ? {display: 'none'} : null}>
                <div className="sound-control__bar">
                    <div className="sound-control__progress" style={{width: (this.props.volume * 100) + "%"}}/>
                </div>
                <button type="button" className="sound-control__btn"
                        style={{left: (this.props.volume * 100) + "%"}}>Громкость
                </button>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        muted: state.player.muted,
        volume: state.player.volume,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        playerStartActions: bindActionCreators(playerStartActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SoundBar);