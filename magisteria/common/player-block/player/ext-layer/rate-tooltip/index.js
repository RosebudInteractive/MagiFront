import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import "./rate-tooltip.sass"


export default function RateTooltip(props) {

    const {playerController} = props

    const [availableRates, setAvailableRates] = useState(playerController.state.availableRates)
    const [currentRate, setCurrentRate] = useState(playerController.state.currentRate)

    useEffect(() => {
        setAvailableRates(playerController.state.availableRates)
        setCurrentRate(playerController.state.rate)

        playerController.subscribe(_onStateChanged)

        return () => {
            playerController.unsubscribe(_onStateChanged)
        }
    }, [])
    useEffect(() => {setAvailableRates(playerController.state.availableRates)}, [availableRates])

    const _onStateChanged = (state) => {
        if (availableRates !== state.availableRates) setAvailableRates(state.availableRates)
        if (currentRate !== state.rate) setCurrentRate(state.rate)
    }

    const _getRates = () => {
        return availableRates.map((item, index) => {
            return <li className={(currentRate === item.value) ? 'active' : ''} key={index}
                       onClick={() => _setRate(item.value)}>
                {item.title ? item.title : item.value}
            </li>
        })
    }

    const _setRate = (value) => {
        if (playerController) playerController.requestSetRate(value)
    }


    return <div className={"speed-tooltip js-player-tooltip js-speed opened"}>
        <header className="speed-tooltip__header">
            <div className="speed-tooltip__title">Скорость</div>
        </header>
        <ul className="speed-tooltip__body">
            {_getRates()}
        </ul>
    </div>
}

RateTooltip.propTypes = {
    playerController: PropTypes.object,
}