import React, {useEffect} from 'react';
import "./sale2021.sass"
import PropTypes from "prop-types";
import Arrow from './arrow.svg';

export default function Sale2021(props) {

    const {config, confirmed, onClose} = props

    useEffect(() => {
        props.onReady()
    })

    const _close = () => {
        if (onClose) {
            onClose()
        }
    }

    const _hidden = !config.visible || (config.visible && confirmed)

    if (_hidden) return null

    return <div className="top-message__sale2021-popup">
        <div className="sale2021-popup__info-block__wrapper">
            <img className="left-image" src="/assets/images/sale2021/left.png" width="502" height="140"/>
            <div className="text-block">
                <div className="text-block__content _mobile">С Новым Годом!</div>
                <div className="text-block__content _desktop">С Новым Годом и Рождеством!</div>
                <div className="text-block__text">До 11 января объявляется новогодняя распродажа со скидками на курсы до
                    35%.
                </div>
            </div>
            <div className="arrow">
                <img src={Arrow} alt="Arrow" />
            </div>
            <img className="right-image" src="/assets/images/sale2021/right.png" width="525" height="140"/>
        </div>
        <div className="sale2021-popup__close-button">
            <button type="button" className="balloon-wrapper__close" onClick={_close}>Закрыть</button>
        </div>
    </div>
}

Sale2021.propTypes = {
    config: PropTypes.object,
    confirmed: PropTypes.bool,
    onClose: PropTypes.func,
    onReady: PropTypes.func
}