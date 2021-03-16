import React, {useEffect, useRef, useMemo} from "react"
import {Field} from "redux-form";
import TextBox from "../../ui-kit/text-box-with-confirm";
import "./header.sass"

type HeaderProps = {
    hasChanged: boolean,
    // taskId: ?string,
    process: any,
    onSave: Function,
}

export default function ProcessHeader(props: HeaderProps) {
    const {hasChanged, taskId, processName} = props

    return <div className="process-page__header">
        <Field component={TextBox} name={"Name"} label={"Название задачи"}/>
        <div className="task-info-block">
            <h6 className="task-info__task-id _grey50">{taskId ? `№${taskId}` : "not saved"}</h6>
            <div className="task-info__separator"/>
            <div className="task-info__process-name font-body-s _white">{processName}</div>
            <button className="task-info__save-button orange-button" disabled={!hasChanged} onClick={props.onSave}>Сохранить</button>
        </div>
    </div>
}
