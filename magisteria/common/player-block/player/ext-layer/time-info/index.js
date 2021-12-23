import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import "./time-info.sass"

import {getTimeFmt} from 'common-tools/time-tools'

export default function TimeInfo(props) {
    const  {playerController} = props;

    const [currentTime, setCurrentTime] = useState(playerController.state.currentTime)
    const [totalDuration, setTotalDuration] = useState(playerController.state.totalDuration)

    useEffect(() => {
        playerController.subscribe(_onStateChanged)

        return () => {
            playerController.unsubscribe(_onStateChanged)
        }
    }, [])

    const _onStateChanged = (state) => {
        if (currentTime !== state.currentTime) setCurrentTime(state.currentTime)
        if (totalDuration !== state.totalDuration) setTotalDuration(state.totalDuration)
    }

    const _playTimeFrm = getTimeFmt(currentTime),
        _total = getTimeFmt(totalDuration)

    return <div className="player-block__info">
        <span className="played-time">{_playTimeFrm}</span>
        <span className="divider">/</span>
        <span className="total-time">{_total}</span>
    </div>
}

TimeInfo.propTypes = {
    playerController: PropTypes.object,
}