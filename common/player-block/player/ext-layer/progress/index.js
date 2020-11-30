import React, {useState, useEffect} from 'react';
import $ from 'jquery'
import {getTimeFmt} from 'common-tools/time-tools'
import "./progress.sass"

import PropTypes from "prop-types"

export default function Progress(props){
    const  {id, playerController} = props;

    const [currentTime, setCurrentTime] = useState(playerController.state.currentTime)
    const [bufferedTime, setBufferedTime] = useState(playerController.state.bufferedTime)
    const [totalDuration, setTotalDuration] = useState(playerController.state.totalDuration)
    const [contentArray, setContentArray] = useState(playerController.state.contentArray)

    let [mousePosition, setMousePosition] = useState(0),
        [mouseTime, setMouseTime] = useState(0),
        [mouseTimeFmt, setMouseTimeFmt] = useState("")

    useEffect(() => {
        playerController.subscribe(_onStateChanged)

        $("#timeline" + id).mousemove((e) => {
            let _current = 0,
                _total = e.currentTarget.offsetWidth - 1;

            if (e.target.closest(".player-block__gap")) {
                _current = e.target.offsetLeft + e.offsetX
            } else {
                _current = e.offsetX
            }

            _calcMousePosition(_current, _total)
        });

        return () => {
            playerController.unsubscribe(_onStateChanged)
        }
    }, [])

    const _onStateChanged = (state) => {
        if (currentTime !== state.currentTime) setCurrentTime(state.currentTime)
        if (bufferedTime !== state.bufferedTime) setBufferedTime(state.bufferedTime)
        if (totalDuration !== state.totalDuration) setTotalDuration(state.totalDuration)
        setContentArray(state.contentArray)
    }

    const _calcMousePosition = (current, total) => {
        let _mousePosition = total ? (current / total) : 0,
            _mouseTime = _mousePosition * totalDuration,
            _mouseTimeFmt = getTimeFmt(_mouseTime);

        setMousePosition(_mousePosition)
        setMouseTime(_mouseTime)
        setMouseTimeFmt(_mouseTimeFmt)
    }

    const _getGaps = () => {
        return totalDuration ?
            contentArray.map((item, index) => {
                let _position = (item.begin * 100) / totalDuration;
                return <div className="player-block__gap" style={{left: _position + '%'}} key={index}/>
            })
            :
            null
    }

    const _setCurrentPosition = () => {
        if (playerController) {
            playerController.requestSetCurrentTime(mouseTime)
        }
    }

    let _playPercent = totalDuration ? ((currentTime * 100) / totalDuration) : 0,
        _bufferedPercent = totalDuration ? ((bufferedTime * 100) / totalDuration) : 0;

    return <div className="player-block__progress" id={"timeline" + id} onClick={_setCurrentPosition}>
        <div className='player-block__timeline'/>
        <div className="player-block__load" style={{width: _bufferedPercent + '%'}}/>
        <div className="player-block__play" style={{width: _playPercent + '%'}}>
            <span className="indicator"/>
        </div>
        {_getGaps()}
        {totalDuration ? <div className="player-block__time" style={{left: (mousePosition * 100) + "%"}}>{mouseTimeFmt}</div> : null}
    </div>
}

Progress.propTypes = {
    id: PropTypes.number,
    playerController: PropTypes.object,
}