import React, {useEffect, useRef, useMemo} from "react"
import {Field} from "redux-form";
import {TextBoxWithConfirm} from "../../ui-kit";
import "./header.sass"

type TaskHeaderProps = {
    hasChanged: boolean,
    taskId: ?string,
    processName: string,
    onSave: Function,
}

export default function TaskHeader(props: TaskHeaderProps) {
    const {hasChanged, taskId, processName} = props

    const _taskNumber = useRef(taskId ? (taskId === -1) ? "Создание задачи" : `№${taskId}` : "not saved")

    return <div className="task-page__header">
        <Field component={TextBoxWithConfirm} name={"Name"} label={"Название задачи"}/>
        <div className="task-info-block">
            <h6 className="task-info__task-id _grey50">{_taskNumber.current}</h6>
            <div className="task-info__separator"/>
            { processName && <div className="task-info__process-name font-body-s _white">{processName}</div> }
            <button className="task-info__save-button orange-button big-button" disabled={!hasChanged} onClick={props.onSave}>Сохранить</button>
        </div>
    </div>
}
