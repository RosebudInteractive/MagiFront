import React, {useState, useEffect} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import "./top-message.sass"
import StorePopup from "./store-popup";
import {popupSelector} from "ducks/version";
import {localSettingsSelector, storePopupClose} from "ducks/app";

function TopMessage(props) {

    const _divRef = React.createRef()

    const _onResize = () => {
        $(".App.global-wrapper").css("top", _divRef.current.clientHeight + "px")
    }

    useEffect(() => {
        $(window).bind("resize", _onResize)
        _onResize()
        return () => {
            $(window).bind("resize", _onResize)
        }
    }, [])

    return <div className="top-balloon-message" ref={_divRef}>
        <StorePopup config={props.config.storePopup} onClose={props.actions.storePopupClose} confirmedMode={props.localSettings.popup.storePopupConfirmedMode}/>
    </div>
}

const mapState2Props = (state) => {
    return {
        config: popupSelector(state),
        localSettings: localSettingsSelector(state)
    }
}

const masDispatch2Props = (dispatch) => {
    return {
        actions: bindActionCreators({storePopupClose}, dispatch)
    }
}

export default connect(mapState2Props, masDispatch2Props)(TopMessage)