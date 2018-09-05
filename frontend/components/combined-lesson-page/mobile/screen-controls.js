import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import * as playerStartActions from '../../../actions/player-start-actions'
import {showScreenControlsSelector} from '../../../ducks/player-screen'
import FadeTimer from '../fade-timer';

class Controls extends React.Component {

    constructor(props) {
        super(props)
        this._timer = new FadeTimer()
    }

    componentDidMount() {

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
        this.props.playerStartActions.startPlay(this.props.lesson.Id)
    }

    _startPause() {
        if (this.props.showScreenControls) {
            this.props.playerStartActions.startPause()
        } else {
            this._timer.restart()
        }
    }

    render() {
        const _backwards = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#backward"/>',
            _pause = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#pause-shad"/>',
            _play = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#play-big"/>',
            _forwards = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#forwards"/>'

        return (
            <div className='lecture-frame__play-block-wrapper'>
                <div className="lecture-frame__play-block">
                    <button type="button" className="lecture-frame__play-control _backwards"
                            onClick={::this._onBackward}>
                        <svg className="icon" width="32" height="21" dangerouslySetInnerHTML={{__html: _backwards}}/>
                        <span className="label">-10</span>
                    </button>
                    {
                        this.props.paused
                            ?
                            <button type="button" className="play-btn-big lecture-frame__play-btn ctrl"
                                    onClick={::this._startPlay}>
                                <span className="visually-hidden">Пауза</span>
                                <svg className="play" width="97" height="86" dangerouslySetInnerHTML={{__html: _play}}/>
                            </button>
                            :
                            <button type="button" className="play-btn-big lecture-frame__play-btn ctrl paused"
                                    onClick={::this._startPause}>
                                <span className="visually-hidden">Воспроизвести</span>
                                <svg className="pause" width="68" height="92"
                                     dangerouslySetInnerHTML={{__html: _pause}}/>
                            </button>
                    }

                    <button type="button" className="lecture-frame__play-control _backwards"
                            onClick={::this._onForward}>
                        <span className="label">+10</span>
                        <svg className="icon" width="32" height="21" dangerouslySetInnerHTML={{__html: _forwards}}/>
                    </button>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        totalDuration: state.player.totalDuration,
        currentTime: state.player.currentTime,
        paused: state.player.paused,
        showScreenControls: showScreenControlsSelector(state)
    }
}

function mapDispatchToProps(dispatch) {
    return {
        playerStartActions: bindActionCreators(playerStartActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Controls);