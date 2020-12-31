import React, {useState, useEffect} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import "./top-message.sass"
import StorePopup from "./store-popup";
import {popupSelector} from "ducks/version";
import {localSettingsSelector, storePopupClose, setAppDivTop, sale2021PopupClose} from "ducks/app";
import Sale2021 from "./sale2021";

const _divRef = React.createRef()

function TopMessage(props) {

    const _onResize = () => {
        if (_divRef && _divRef.current) {
            props.actions.setAppDivTop(_divRef.current.clientHeight)
            // $(".App.global-wrapper").css("top", _divRef.current.clientHeight + "px")
        }
    }

    useEffect(() => {
        $(window).bind("resize", _onResize)
        _onResize()
        return () => {
            $(window).bind("resize", _onResize)
        }
    }, [props.config])

    return <div className="top-balloon-message" ref={_divRef}>
        <StorePopup config={props.config.storePopup}
                    onClose={props.actions.storePopupClose}
                    confirmedMode={props.localSettings.popup.storePopupConfirmedMode}
                    onReady={_onResize}/>
        <Sale2021 config={props.config.sale2021}
                  confirmed={props.localSettings.popup.sale2021PopupConfirmed}
                  onClose={props.actions.sale2021PopupClose}
                  onReady={_onResize}/>
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
        actions: bindActionCreators({storePopupClose, sale2021PopupClose, setAppDivTop}, dispatch)
    }
}

export default connect(mapState2Props, masDispatch2Props)(TopMessage)