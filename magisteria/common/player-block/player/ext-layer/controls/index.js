import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import $ from 'jquery'
import "./controls.sass"
import {isMobileAppleDevice} from "common-tools/platform";

const SVG = {
    BACKWARD: '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#backward"/>',
    FORWARD: '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#forward"/>',
    PAUSE: '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#pause"/>',
    PLAY: '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#play"/>',
    SOUND: '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#sound"/>',
    MUTE: '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#mute"/>',
}

export default function Controls(props) {
    const {id, playerController} = props

    const [currentTime, setCurrentTime] = useState(playerController.state.currentTime)
    const [totalDuration, setTotalDuration] = useState(playerController.state.totalDuration)
    const [paused, setPausedState] = useState(playerController.state.paused)
    const [muted, setMutedState] = useState(playerController.state.muted)
    const [volume, setVolumeState] = useState(playerController.state.volume)

    useEffect(() => {
        $("#sound-bar" + id).click((event) => {
            let _current = event.offsetX,
                _total = event.currentTarget.offsetWidth - 1;
            _setVolume(_current, _total)
        });

        playerController.subscribe(_onStateChanged)

        return () => {
            playerController.unsubscribe(_onStateChanged)
        }
    }, [])

    const _onStateChanged = (state) => {
        if (currentTime !== state.currentTime) setCurrentTime(state.currentTime)
        if (totalDuration !== state.totalDuration) setTotalDuration(state.totalDuration)
        if (paused !== state.paused) setPausedState(state.paused)
        if (muted !== state.muted) setMutedState(state.muted)
        if (volume !== state.volume) setVolumeState(state.volume)
    }

    const _onBackward = () => {
        let _newPosition = (currentTime < 10) ? 0 : (currentTime - 10);
        playerController.requestSetCurrentTime(_newPosition)
    }

    const _setVolume = (current, total) => {
        let value = total ? (current / total) : 0
        playerController.requestSetVolume(value)
    }

    const _startPlay = () => {
        playerController.requestPlay()
    }

    const _startPause = () => {
        playerController.requestPause()
    }

    const _onForward = () => {
        let _newPosition = (totalDuration - currentTime < 10) ? totalDuration : (currentTime + 10);
        playerController.requestSetCurrentTime(_newPosition)
    }

    const _toggleMute = () => {
        playerController.requestToggleMute()
    }

    let _isIOS = isMobileAppleDevice(),
        _needHideSoundControl = (muted || _isIOS)

    return <div className="player__controls-block__buttons">
        <button type="button" className="control-button backwards" onClick={_onBackward}>
            <svg width="18" height="11" dangerouslySetInnerHTML={{__html: SVG.BACKWARD}}/>
        </button>
        {paused ?
            <button type="button" className="control-button play-button" onClick={_startPlay}>
                <svg className="play" width="19" height="19" dangerouslySetInnerHTML={{__html: SVG.PLAY}}/>
            </button>
            :
            <button type="button" className="control-button play-button paused" onClick={_startPause}>
                <svg className="pause" width="11" height="18" dangerouslySetInnerHTML={{__html: SVG.PAUSE}}/>
            </button>

        }
        <button type="button" className="control-button forward" onClick={_onForward}>
            <svg width="18" height="16" dangerouslySetInnerHTML={{__html: SVG.FORWARD}}/>
        </button>
        { playerController.config.player.lessonNavButtons && playerController.getLessonNavigateButtons() }
        <button type="button" className="control-button sound-button" style={_isIOS ? {display: 'none'} : null} onClick={_toggleMute}>
        {
            muted ?
                <svg className="off" width="18" height="18" dangerouslySetInnerHTML={{__html: SVG.MUTE}}/>
                :
                <svg className="on" width="18" height="18" dangerouslySetInnerHTML={{__html: SVG.SOUND}}/>
        }
        </button>
        <div className="sound-control" id={'sound-bar' + id} style={_needHideSoundControl ? {display: 'none'} : null}>
            <div className="sound-control__bar">
                <div className="sound-control__progress" style={{width: (volume * 100) + "%"}}/>
            </div>
            <button type="button" className="control-button sound-control__btn"
                    style={{left: (volume * 100) + "%"}}>Громкость
            </button>
        </div>
    </div>
}

Controls.propTypes = {
    id: PropTypes.number,
    playerController: PropTypes.object,
}

