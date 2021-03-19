import React, {useMemo} from "react"
import {Field} from "redux-form";
import {TextBoxWithConfirm} from "../../ui-kit";
import "./header.sass"
import {PROCESS_STATE} from "../../../constants/states";
import BackArrow from "tt-assets/svg/back-arrow.svg"

type HeaderProps = {
    hasChanges: boolean,
    state: number,
    onSave: Function,
    onBack: Function,
}

export default function ProcessHeader(props: HeaderProps) {
    const {hasChanges, state} = props

    const _state = useMemo(()=>{
        const result = Object.values(PROCESS_STATE).find(item => item.value === state)

        return result ? result : {label: "Ошибка", css: "_error"}
    }, [state])

    return <div className="process-page__header">
        <div className="header__back-arrow" onClick={props.onBack}>
            <BackArrow/>
        </div>
        <div className="process-page__field-name">
            <Field component={TextBoxWithConfirm} name={"Name"} label={"Название процесса"}/>
        </div>
        <div className={"header__process-state font-body-s " + _state.css}>{_state.label}</div>
        <button className="process-page__save-button orange-button big-button" disabled={!hasChanges} onClick={props.onSave}>Сохранить</button>
    </div>
}
