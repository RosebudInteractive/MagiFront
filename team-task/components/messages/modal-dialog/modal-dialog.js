import React, {useEffect} from "react";
import './modal-dialog.sass';
import CloseIco from "tt-assets/svg/close.svg"
import ExclamationPointIco from "tt-assets/svg/exclamation-point.svg"
import {connect} from 'react-redux'
import {bindActionCreators} from "redux";
import {
    showError,
    showInfo,
    showWarning,
    showUserConfirmation,
    toggleMessage,
    messageSelector,
    ERROR, CONFIRMATION
} from "tt-ducks/messages";




function ModalDialog(props) {
    const MESSAGE_CONFIRMATION_TYPE = CONFIRMATION;
    const message = props.message;

    const declineAction = ()=>{
        //some DECLINE logic here

        closeMessage()
    };

    const confirmAction = ()=>{
        //some CONFIRM logic here

        closeMessage()
    };

    const closeMessage  = () => {
        props.actions.toggleMessage(false);
    };


    return (
        <React.Fragment>
            { (message && message.visible) &&
            <div className="modal-dialog">
                <div className={`modal-dialog__inner-window message-type_${message.type}`}>
                    <div className="modal-dialog__close-button" onClick={closeMessage}>
                        <CloseIco viewBox="5 5 15 15"/>
                    </div>
                    <div className="modal-dialog__info-icon">
                        <ExclamationPointIco/>
                    </div>
                    <div className="modal-dialog__title">
                        {message.title}
                    </div>
                    <div className="modal-dialog__text">
                        {message.content}
                    </div>
                    <div className="modal-dialog__actions">
                        {message.type === MESSAGE_CONFIRMATION_TYPE &&
                        <button className="cancel" onClick={declineAction}>
                            No, thanks!
                        </button>}
                        <button className="confirm" onClick={confirmAction}>
                            I agree with it!
                        </button>
                    </div>
                </div>
            </div>}
        </React.Fragment>

    );
}

const mapState2Props = (state) => {
    return {
        message: messageSelector(state)
    }
};

const mapDispatch2Props = (dispatch) => {
    return {
        actions: bindActionCreators({
            showError,
            showWarning,
            showInfo,
            showUserConfirmation,
            toggleMessage
        }, dispatch)
    }
}

export default connect(mapState2Props, mapDispatch2Props)(ModalDialog)
