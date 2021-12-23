import React from 'react';
import PropTypes from "prop-types";
import "./store-popup.sass"
import {isMobilePlatform} from "tools/page-tools";

export const STORE_BUTTON_TYPE = {APPLE: "APPLE", ANDROID: "ANDROID"}
export const STORE_BUTTON_SIZE = {SMALL: 1, BIG: 2}

export default function StoreButton(props) {

    const {visible, size, type, link, disabled} = props

    const _isMobilePlatform = isMobilePlatform()

    const _handleClick = () => {
        if (disabled || !link) return

        // if (_isMobilePlatform) {
        //     window.location.replace("magisteria://")
        //     setTimeout(() => {
        //         window.location.href = link
        //     }, 1000);
        // } else {
        window.open(link)
        // }

    }

    const _getSmallImage = () => {
        return _isMobilePlatform ?
            type === STORE_BUTTON_TYPE.APPLE ?
                "/images/store-popup/apple-ico.png"
                :
                disabled ?
                    "/images/store-popup/android-ico-disabled.png"
                    :
                    "/images/store-popup/android-ico.png"
            :
            type === STORE_BUTTON_TYPE.APPLE ?
                "/images/store-popup/app-store-small.png"
                :
                disabled ?
                    "/images/store-popup/google-play-small-disabled.png"
                    :
                    "/images/store-popup/google-play-small.png"

    }

    const _getBigImage = () => {
        return type === STORE_BUTTON_TYPE.APPLE ?
            "/images/store-popup/app-store.png"
            :
            disabled ?
                "/images/store-popup/google-play-disabled.png"
                :
                "/images/store-popup/google-play.png"
    }

    const _image = size === STORE_BUTTON_SIZE.BIG ? _getBigImage() : _getSmallImage()

    return visible ?
        <button type="button" className={"store-button" + (type === STORE_BUTTON_TYPE.APPLE ? " _apple" : " _android")} onClick={_handleClick}>
            <img src={_image}/>
        </button>
        :
        null
}

StoreButton.propTypes = {
    type: PropTypes.string,
    size: PropTypes.number,
    link: PropTypes.string,
    disabled: PropTypes.bool,
    visible: PropTypes.bool,
}

StoreButton.defaultProps = {
    visible: true,
    disabled: false,
    size: STORE_BUTTON_SIZE.BIG
}
