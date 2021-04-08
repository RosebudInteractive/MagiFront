import React, {useState, useEffect} from 'react';
import "./store-popup.sass"
import StoreButton, {STORE_BUTTON_SIZE, STORE_BUTTON_TYPE} from "./store-button";
import {isMobileAppleDevice, isMobilePlatform} from "tools/page-tools";
import PropTypes from "prop-types";
import {MOBILE_STORE_MODE} from "../../../../constants/common-consts";

export default function StorePopup(props) {

    const {confirmedMode, popupConfig, mobileAppLinks, onClose} = props
    const [mode, setMode] = useState(MOBILE_STORE_MODE.NONE)

    useEffect(() => {
        const _mode = ( (popupConfig.ios.visible && mobileAppLinks.ios) && (popupConfig.android.visible && mobileAppLinks.android) ) ?
            MOBILE_STORE_MODE.BOTH
            :
            ( (popupConfig.ios.visible && mobileAppLinks.ios) && !popupConfig.android.visible ) ?
                MOBILE_STORE_MODE.ONLY_IOS
                :
                MOBILE_STORE_MODE.NONE

        setMode(_mode)
    }, [popupConfig])

    useEffect(() => {
        props.onReady()
    })

    const _close = () => { if (onClose) { onClose(mode) } }

    const _isMobilePlatform = isMobilePlatform(),
        _isAppleMobile = isMobileAppleDevice()

    const _hidden = (mode === MOBILE_STORE_MODE.NONE) ||
        (mode === confirmedMode) ||
        (_isAppleMobile && (confirmedMode >= MOBILE_STORE_MODE.ONLY_IOS)) ||
        (_isMobilePlatform && !_isAppleMobile && (mode < MOBILE_STORE_MODE.BOTH))

    const _onLinkClick = (e) => {
        // window.open("magisteria://")
        // e.preventDefault()
        // e.returnValue = false

        // setTimeout(() => {
        window.open(_isAppleMobile ? mobileAppLinks.ios : mobileAppLinks.android)
        // }, 1000);
    }

    if (_hidden) return null

    return <div className={"top-message__store-popup" + (_isMobilePlatform ? " _mobile" : " _desktop")}>
        <div className="top-message__background _main"/>
        <div className="top-message__background _shadow"/>
        <div className="store-popup__info-block__wrapper">
            <div className={"store-popup__info-block _big" + (_isMobilePlatform ? " _mobile" : " _desktop")}>
                <div className="phone-image">
                    <img className="phone-image__main" src="/assets/images/store-popup/phone.png" width="276" height="263"/>
                    <img className="phone-image__pods" src="/assets/images/store-popup/pods.png"/>
                </div>
                <div className="text-block">
                    <div className="text-block__content font-universal__title-small _white">Загрузите мобильное приложение</div>
                    <div className="text-block__text font-universal__body-medium _white">Мобильное приложение, с которым наши
                        лекции и материалы удобно смотреть и слушать в любом месте</div>
                </div>
                <div className={"buttons-block" + (_isMobilePlatform ? " _single" : " _all")}>
                    <StoreButton size={STORE_BUTTON_SIZE.BIG}
                                 type={STORE_BUTTON_TYPE.APPLE}
                                 link={mobileAppLinks.ios}
                                 visible={!_isMobilePlatform || _isAppleMobile}/>
                    <StoreButton size={STORE_BUTTON_SIZE.BIG}
                                 type={STORE_BUTTON_TYPE.ANDROID}
                                 link={mobileAppLinks.android}
                                 disabled={mode !== MOBILE_STORE_MODE.BOTH}
                                 visible={!_isMobilePlatform || !_isAppleMobile}/>
                </div>
            </div>
            <div className={"store-popup__info-block _small" + (_isMobilePlatform ? " _mobile" : " _desktop")}>
                {
                    _isMobilePlatform &&
                    <div className="store-popup__mobile-logo">
                        <StoreButton size={STORE_BUTTON_SIZE.SMALL}
                                     type={STORE_BUTTON_TYPE.APPLE}
                                     link={mobileAppLinks.ios}
                                     visible={isMobileAppleDevice()}/>
                        <div className="button-border"/>
                        <StoreButton size={STORE_BUTTON_SIZE.SMALL}
                                     type={STORE_BUTTON_TYPE.ANDROID}
                                     link={mobileAppLinks.android}
                                     disabled={mode !== MOBILE_STORE_MODE.BOTH}
                                     visible={!isMobileAppleDevice()}/>
                    </div>
                }
                <div className="text-block">
                    <div className="text-block__text font-universal__body-medium _mobile _white">Наши лекции и материалы удобно
                        смотреть и слушать в мобильном приложении</div>
                </div>
                <div className={"buttons-block" + (_isMobilePlatform ? " _single" : " _all")}>
                    {
                        _isMobilePlatform ?
                            <div className="store-button__link font-universal__body-medium _white" onClick={_onLinkClick}>Загрузить</div>
                            :
                            <React.Fragment>
                                <StoreButton size={STORE_BUTTON_SIZE.SMALL}
                                             type={STORE_BUTTON_TYPE.APPLE}
                                             link={mobileAppLinks.ios}
                                             visible={true}/>
                                <div className="button-border"/>
                                <StoreButton size={STORE_BUTTON_SIZE.SMALL}
                                             type={STORE_BUTTON_TYPE.ANDROID}
                                             link={mobileAppLinks.android}
                                             disabled={mode !== MOBILE_STORE_MODE.BOTH}
                                             visible={!isMobileAppleDevice()}/>
                            </React.Fragment>
                    }
                </div>
            </div>
        </div>
        <div className="store-popup__close-button">
            <button type="button" className="balloon-wrapper__close" onClick={_close}>Закрыть</button>
        </div>
    </div>
}

StorePopup.propTypes = {
    confirmedMode: PropTypes.number,
    popupConfig: PropTypes.object,
    mobileAppLinks: PropTypes.object,
    onClose: PropTypes.func,
    onReady: PropTypes.func
}
