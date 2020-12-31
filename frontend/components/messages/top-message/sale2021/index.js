import React, {useEffect} from 'react';
import "./sale2021.sass"
import PropTypes from "prop-types";
import Arrow from './arrow.svg';
import ArrowPhone from './arrow-mobile.svg';

export default function Sale2021(props) {

    const {config, confirmed, onClose} = props

    useEffect(() => {
        props.onReady()
    })

    useEffect(() => {
        $(window).bind("resize", _onResize)
        _onResize()
        return () => {
            $(window).bind("resize", _onResize)
        }
    })

    const _close = () => {
        if (onClose) {
            onClose()
        }
    }

    const _onResize = () => {
        const _discountButton = $(".discount-button"),
            _arrow = $(".arrow")

        if (_discountButton && _discountButton.length) {
            const _left = _discountButton.offset().left  - _arrow.width() + (_discountButton.outerWidth() * 0.5) + 6
            _arrow.css("left", `${_left}px`)
        }
    }

    const _hidden = !config.visible || (config.visible && confirmed)

    if (_hidden) return null

    return <div className="top-message__sale2021-popup">
        <div className="sale2021-popup__info-block__wrapper">
            <img className="left-image" src="/assets/images/sale2021/left.png"/>
            <div className="text-block">
                <div className="text-block__content _mobile">С Новым Годом!</div>
                <div className="text-block__content _desktop">С Новым Годом и Рождеством!</div>
                <div className="text-block__text _desktop">До 11 января объявляется новогодняя распродажа со скидками на курсы до
                    35%.
                </div>
                <div className="text-block__text _phone">Скидки до 35%,  до 11 января.</div>
            </div>
            <div className="arrow">
                <img className="_desktop" src={Arrow} alt="Arrow" />
                <img className="_phone" src={ArrowPhone} alt="Arrow" />
            </div>
            <img className="right-image" src="/assets/images/sale2021/right.png"/>
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