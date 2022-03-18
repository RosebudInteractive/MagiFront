import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import * as playerStartActions from 'actions/player-start-actions'
import {showScreenControlsSelector} from 'ducks/player-screen'
import Backward from "./backward";
import Central from "./central";
import Forward from "./forward";

class Controls extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div className='lecture-frame__play-block-wrapper'>
                <div className="lecture-frame__play-block">
                    <Backward onClick={::this._onBackward}/>
                    <Central paused={this.props.paused}/>
                    <Forward onClick={::this._onForward}/>
                </div>
            </div>
        );
    }

    _onBackward() {
        if (this.props.showScreenControls) {
            let _newPosition = (this.props.currentTime < 10) ? 0 : (this.props.currentTime - 10);
            this.props.playerStartActions.startSetCurrentTime(_newPosition);
        } else {
            this._timer.restart()
        }
    }

    _onForward() {
        if (this.props.showScreenControls) {
            let _newPosition = (this.props.totalDuration - this.props.currentTime < 10) ? 0 : (this.props.currentTime + 10);
            this.props.playerStartActions.startSetCurrentTime(_newPosition);
        } else {
            this._timer.restart()
        }
    }

    _setVolume(current, total) {
        let value = total ? (current / total) : 0
        this.props.playerStartActions.startSetVolume(value)
    }

    _startPlay() {
        this.props.playerStartActions.preinitAudios(this.props.audios);
        this.props.playerStartActions.startPlay({lessonId: this.props.lesson.Id})
    }

    _startPause(e) {
        if (this.props.showScreenControls) {
            this.props.playerStartActions.startPause()
        } else {
            this._timer.restart()
        }
    }


}

function mapStateToProps(state) {
    return {
        totalDuration: state.player.totalDuration,
        currentTime: state.player.currentTime,
        // paused: state.player.paused,
        showScreenControls: showScreenControlsSelector(state)
    }
}

function mapDispatchToProps(dispatch) {
    return {
        playerStartActions: bindActionCreators(playerStartActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Controls);