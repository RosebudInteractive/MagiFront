import React, {useRef} from "react"
import {Field} from "redux-form";
import {TitleTextBox} from "../../ui-kit";
import "./header.sass"
import taskController from "../../../tools/task-controller";
import {Link} from "react-router-dom";

type TaskHeaderProps = {
    hasChanged: boolean,
    taskId: ?string,
    processName: string,
    processId: number,
    onSave: Function,
}

export default function TaskHeader(props: TaskHeaderProps) {
    const {hasChanged, taskId, processName, processId} = props

    const _taskNumber = useRef(taskId ? (taskId === -1) ? "Создание задачи" : `№${taskId}` : "not saved")

    const _lockTaskName = (!taskController.fieldsEnable.form) || (!taskController.fieldsEnable.taskName)

    return <div className="task-page__header">
        <Field component={TitleTextBox} name={"Name"} label={"Название задачи"} extClass={"page-title"} readOnly={_lockTaskName} disabled={_lockTaskName}/>
        <div className="task-info-block">
            <h6 className="task-info__task-id _grey50">{_taskNumber.current}</h6>
            <div className="task-info__separator"/>
            { processName && <div className="task-info__process-name font-body-s _white">
                <Link style={{ textDecoration: 'none', color: 'white', cursor: 'pointer'}} to={`/process/${processId}`}>{processName}</Link></div> }
            <button className="task-info__save-button orange-button big-button" disabled={!hasChanged} onClick={props.onSave}>Сохранить</button>
        </div>
    </div>
}
