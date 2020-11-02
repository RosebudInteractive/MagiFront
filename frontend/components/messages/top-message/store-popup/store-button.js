import React from 'react';
import PropTypes from "prop-types";
import "./store-popup.sass"

export const STORE_BUTTON_TYPE = {APPLE: "APPLE", ANDROID: "ANDROID"}
export const STORE_BUTTON_SIZE = {SMALL: 1, BIG: 2}

export default function StoreButton(props) {

    const {visible, size, type, link, disabled} = props

    const _handleClick = () => {
        if (disabled || !link) return

        window.location.replace("magisteria://")
        setTimeout(() => {
            window.location.href = link
        }, 2000);
    }

    const _getSmallImage = () => {
        return type === STORE_BUTTON_TYPE.APPLE ?
            "/assets/images/store-popup/apple-ico.png"
            :
            "/assets/images/store-popup/android-ico.png"
    }

    const _getBigImage = () => {
        return type === STORE_BUTTON_TYPE.APPLE ?
            "/assets/images/store-popup/app-store.png"
            :
            disabled ?
                "/assets/images/store-popup/google-play-disabled.png"
                :
                "/assets/images/store-popup/google-play.png"
    }

    const _image = size === STORE_BUTTON_SIZE.BIG ? _getBigImage() : _getSmallImage()

    return visible ?
        <button type="button" className="store-button" onClick={_handleClick}>
            <img src={_image}/>
        </button>
        :
        null
}

StoreButton.propTypes = {
    type: PropTypes.string,
    size: PropTypes.number,
    link: PropTypes.string,
    disabled: PropTypes.bool
}