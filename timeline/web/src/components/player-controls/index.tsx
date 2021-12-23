import React from "react";
import './player-controls.sass'

type Props = {
    onPlay: Function,
    onPause: Function,
    onSeek: Function,
    onStop: Function,
    isPlaying: boolean,
    isStopped: boolean,
    scriptTime: number,
}

export default function PlayerControls(props: Props): JSX.Element {

    const {isPlaying, isStopped, scriptTime} = props

    const _backward = () => {
        props.onSeek(-3)
    }

    const _forward = () => {
        props.onSeek(3)
    }

    const _play = () => {
        props.onPlay()
    }

    const _pause = () => {
        props.onPause()
    }

    const _stop = () => {
        props.onStop()
    }

    return <div className="controls-panel">
        <div className="player-controls">
            <button className="player-controls__button _backward" onClick={_backward}>{"-3c ⏪"}</button>
            <button className="player-controls__button _stop" onClick={_stop} disabled={isStopped}>{"⏹"}</button>
            {isPlaying ?
                <button className="player-controls__button _pause" onClick={_pause}>{"⏸"}</button>
                :
                <button className="player-controls__button _play" onClick={_play}>{"▶️"}</button>
            }
            <button className="player-controls__button _forward" onClick={_forward}>{"⏩ +3c"}</button>
        </div>
        <div className="player-time">
            {Number.isNaN(scriptTime) ? 0 : scriptTime } c
        </div>
    </div>
}
