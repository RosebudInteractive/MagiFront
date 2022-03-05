import React, {useEffect} from "react";
import './modal-dialog.sass';
import CloseIco from "tt-assets/svg/close.svg"
import ExclamationPointIco from "tt-assets/svg/exclamation-point.svg"
import type {ModalDialogProps} from "../../../types/messages";
import {MESSAGE_TYPE} from "../../../constants/messages";

export default function ModalDialog(props: ModalDialogProps) {
    const MESSAGE_CONFIRMATION_TYPE = MESSAGE_TYPE.CONFIRMATION;
    const {message, actions} = props;

    const declineAction = (e) => {
        //some DECLINE logic here
        if (actions && actions.declineAction) actions.declineAction()
        hideMessage()
        e.preventDefault()
    };

    const confirmAction = (e) => {
        //some CONFIRM logic here
        if (actions && actions.confirmAction) actions.confirmAction()
        hideMessage()
        e.preventDefault()
    };

    const onCloseClick = (e) => {
        if (actions && actions.closeAction) {
            actions.closeAction()
            hideMessage()
            e.preventDefault()
        } else {
            declineAction(e)
        }
    }

    const hideMessage = () => {
        if (actions && actions.toggleMessage) actions.toggleMessage(false);
    };


    return (message && message.visible) &&
        <div className="modal-dialog">
            <div className={`modal-dialog__inner-window message-type_${message.type}`}>
                <div className="modal-dialog__close-button" onClick={onCloseClick}>
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
                        {message.declineButtonText}
                    </button>}
                    <button className="confirm" onClick={confirmAction}>
                        {message.confirmButtonText}
                    </button>
                </div>
            </div>
        </div>
}
