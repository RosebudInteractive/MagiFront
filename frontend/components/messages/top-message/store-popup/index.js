import React, {useState, useEffect} from 'react';
import "./store-popup.sass"
import StoreButton, {STORE_BUTTON_SIZE, STORE_BUTTON_TYPE} from "./store-button";
import {isMobileAppleDevice, isMobilePlatform} from "tools/page-tools";
import PropTypes from "prop-types";
import {STORE_POPUP_MODE} from "../../../../constants/common-consts";

export default function StorePopup(props) {

    const {confirmedMode, config, onClose} = props
    const [mode, setMode] = useState(STORE_POPUP_MODE.NONE)

    useEffect(() => {
        const _mode = (config.ios.visible && config.android.visible) ?
            STORE_POPUP_MODE.BOTH
            :
            (config.ios.visible && !config.android.visible) ?
                STORE_POPUP_MODE.ONLY_IOS
                :
                STORE_POPUP_MODE.NONE

        setMode(_mode)
    }, [config])

    const _close = () => { if (onClose) { onClose(mode) } }

    const _isMobilePlatform = isMobilePlatform(),
        _isAppleMobile = isMobileAppleDevice()

    const _hidden = (mode === STORE_POPUP_MODE.NONE) ||
        (mode === confirmedMode) ||
        (_isAppleMobile && (confirmedMode >= STORE_POPUP_MODE.ONLY_IOS)) ||
        (_isMobilePlatform && !_isAppleMobile && (mode < STORE_POPUP_MODE.BOTH))

    const _onLinkClick = () => {
        window.location.replace("magisteria://")
        setTimeout(() => {
            window.location.href = _isAppleMobile ? config.ios.link : config.android.link
        }, 2000);

    }

    if (_hidden) return null

    return <div className={"top-message__store-popup" + (_isMobilePlatform ? " _mobile" : " _desktop")}>
        <div className={"store-popup__info-block _big" + (_isMobilePlatform ? " _mobile" : " _desktop")}>
            <img className="phone-image" src="/assets/images/store-popup/phone.png" width="276" height="263"/>
            <div className="text-block">
                <div className="text-block__content font-universal__title-small">Загрузите мобильное приложение</div>
                <div className="text-block__text font-universal__body-medium">Мобильное приложение, с которым наши
                    лекции и материалы удобно смотреть и слушать в любом месте</div>
            </div>
            <div className={"buttons-block" + (_isMobilePlatform ? " _single" : " _all")}>
                <StoreButton size={STORE_BUTTON_SIZE.BIG}
                             type={STORE_BUTTON_TYPE.APPLE}
                             link={config.ios.link}
                             visible={true}/>
                <StoreButton size={STORE_BUTTON_SIZE.BIG}
                             type={STORE_BUTTON_TYPE.ANDROID}
                             link={config.android.link}
                             disabled={mode !== STORE_POPUP_MODE.BOTH}
                             visible={!isMobileAppleDevice()}/>
            </div>
        </div>
        <div className={"store-popup__info-block _small" + (_isMobilePlatform ? " _mobile" : " _desktop")}>
            <img className="magisteria-logo" src="/assets/images/store-popup/magisteria-ico.png" width="96" height="96"/>
            <div className="text-block">
                <div className="text-block__text font-universal__body-medium _mobile">Наши лекции и материалы удобно
                    смотреть и слушать в любом месте</div>
            </div>
            <div className={"buttons-block" + (_isMobilePlatform ? " _single" : " _all")}>
                {
                    _isMobilePlatform ?
                        <div className="store-button__link font-universal__body-medium _orange" onClick={_onLinkClick}>Загрузить</div>
                        :
                        <React.Fragment>
                            <StoreButton size={STORE_BUTTON_SIZE.SMALL}
                                         type={STORE_BUTTON_TYPE.APPLE}
                                         link={config.ios.link}
                                         visible={true}/>
                            <div className="button-border"/>
                            <StoreButton size={STORE_BUTTON_SIZE.SMALL}
                                         type={STORE_BUTTON_TYPE.ANDROID}
                                         link={config.android.link}
                                         disabled={mode !== STORE_POPUP_MODE.BOTH}
                                         visible={!isMobileAppleDevice()}/>
                        </React.Fragment>
                }
            </div>
        </div>
        <div className="store-popup__close-button">
            <button type="button" className="balloon-wrapper__close" onClick={_close}>Закрыть</button>
        </div>
    </div>
}

StorePopup.propTypes = {
    confirmedMode: PropTypes.number,
    config: PropTypes.object,
    onClose: PropTypes.func
}