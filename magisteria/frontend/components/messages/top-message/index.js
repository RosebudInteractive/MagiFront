import PropTypes from "prop-types"
import React, {useState, useEffect} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import "./top-message.sass"
import StorePopup from "./store-popup";
import {mobileAppSelector, popupSelector} from "ducks/version";
import {localSettingsSelector, storePopupClose, setAppDivTop, sale2021PopupClose, sale2022PopupClose} from "ducks/app";
import Sale2021 from "./sale2021";
import Sale2022 from "./sale2022";

const _divRef = React.createRef()

function TopMessage(props) {

    const {config, mobileAppLinks, localSettings, headerVisible, pageHeaderState} = props

    const _onResize = () => {
        if (_divRef && _divRef.current) {
            props.actions.setAppDivTop(_divRef.current.clientHeight)
        }
    }

    useEffect(() => {
        $(window).bind("resize", _onResize)
        _onResize()
        return () => {
            $(window).unbind("resize", _onResize)
        }
    }, [props.config])

    return <div className="top-balloon-message" ref={_divRef}>
        <StorePopup popupConfig={config.storePopup}
                    mobileAppLinks={mobileAppLinks}
                    onClose={props.actions.storePopupClose}
                    confirmedMode={localSettings.popup.storePopupConfirmedMode}
                    onReady={_onResize}/>
        <Sale2021 config={config.sale2021}
                  confirmed={localSettings.popup.sale2021PopupConfirmed}
                  onClose={props.actions.sale2021PopupClose}
                  onReady={_onResize}
                  headerVisible={headerVisible && pageHeaderState.visibility}/>
        <Sale2022 config={config.sale2022}
                  confirmed={localSettings.popup.sale2022PopupConfirmed}
                  onClose={props.actions.sale2022PopupClose}
                  onReady={_onResize}
                  headerVisible={headerVisible && pageHeaderState.visibility}/>
    </div>
}

TopMessage.propTypes = {
    headerVisible: PropTypes.bool,
}

const mapState2Props = (state) => {
    return {
        config: popupSelector(state),
        mobileAppLinks: mobileAppSelector(state),
        localSettings: localSettingsSelector(state),
        pageHeaderState: state.pageHeader
    }
}

const masDispatch2Props = (dispatch) => {
    return {
        actions: bindActionCreators({
            storePopupClose,
            sale2021PopupClose,
            sale2022PopupClose,
            setAppDivTop
        }, dispatch)
    }
}

export default connect(mapState2Props, masDispatch2Props)(TopMessage)
