import React from "react";
import {connect} from 'react-redux'
import {bindActionCreators} from "redux";
import {
    acceptAction,
    declineAction,
    toggleMessage,
    messageSelector,
} from "tt-ducks/messages";
import ModalDialog from "./modal-dialog";
import type {ModalDialogActions} from "../../../types/messages";


function ReduxModalDialog(props) {
    const _actions: ModalDialogActions = {
        confirmAction: props.actions.acceptAction,
        declineAction: props.actions.declineAction,
        toggleMessage: props.actions.toggleMessage
    }

    return <ModalDialog message={props.message} actions={_actions}/>
}

const mapState2Props = (state) => {
    return {
        message: messageSelector(state)
    }
};

const mapDispatch2Props = (dispatch) => {
    return {
        actions: bindActionCreators({
            acceptAction,
            declineAction,
            toggleMessage
        }, dispatch)
    }
}

export default connect(mapState2Props, mapDispatch2Props)(ReduxModalDialog)
