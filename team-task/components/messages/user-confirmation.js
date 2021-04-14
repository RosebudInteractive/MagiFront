import React, {useEffect, useMemo, useState} from 'react'
import {render} from "react-dom";
import {MESSAGE_TYPE} from "../../constants/messages";
import {PureModalDialog} from "./modal-dialog/index"
import type {Message, ModalDialogActions} from "../../types/messages";

export const getConfirmation = (message, callback) => {
    render((
        <UserConfirmation message={message} callback={callback}/>
    ), document.getElementById('team-task__prompt-user-confirmation'));
};

const UserConfirmation = (props) => {
    const {message, callback} = props

    const [visible, setVisible] = useState(false)

    useEffect(() => { setVisible(true) }, [props])

    const _message: Message = useMemo(() => {
        const _result: Message = {
            visible: visible,
            content: message,
            type: MESSAGE_TYPE.CONFIRMATION,
            title: "Подверждение перехода",
            confirmButtonText: "Да, хочу!",
            declineButtonText: "Нет, остаться"
        }
        return _result
    }, [visible])

    const _actions: ModalDialogActions = {
        confirmAction: () => {
            callback(true)
            setVisible(false)
        },
        declineAction: () => {
            callback(false);
            setVisible(false)
        },
        toggleMessage: () => {
            callback(false);
            setVisible(false)
        }
    }

    return <PureModalDialog message={_message} actions={_actions}/>
};
