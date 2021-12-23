import React, {useState} from "react";
import PropTypes from "prop-types";
import Cover from "./cover";
import Player from "./player"
import "./player-block.sass"
import {PLAYER_CONTROLLER_MODE} from "../constants/common-consts";

export default function PlayerBlockWrapper(props) {
    const [mode, setMode] = useState(PLAYER_CONTROLLER_MODE.COVER)

    const {lesson, playerController} = props

    playerController.onChangeMode = (value) => {
        setMode(value)
    }

    return <div className="player-block js-player desktop">
        <Cover visible={mode === PLAYER_CONTROLLER_MODE.COVER} lesson={lesson} playerController={props.playerController}/>
        <Player visible={mode === PLAYER_CONTROLLER_MODE.PLAYER} lesson={lesson} playerController={props.playerController} PauseScreen={props.PauseScreen}/>
    </div>
}

PlayerBlockWrapper.propTypes = {
    lesson: PropTypes.object,
    playerController: PropTypes.object,
    PauseScreen: PropTypes.element,
}