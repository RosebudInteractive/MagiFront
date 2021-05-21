import React, {useMemo} from "react"
import {Field} from "redux-form";
import {TextBox, Select, DatePicker} from "../../../ui-kit";
import CommentBlock from "./сomment-block";
import "./right-block.sass"
import {TASK_STATE} from "../../../../constants/states";
import taskController from "../../../../tools/task-controller";

type TaskBodyProps = {
    users: Array,
    task: any,
}

export default function RightBlock(props: TaskBodyProps) {
    const {task, users,} = props

    const _stateOptions = useMemo(() => {
        return Object.values(TASK_STATE)
            .map((item) => {
                return taskController.newStates.includes(item.value) || (item.value === task.State) ? {id: item.value, name: item.label} : null
            })
            .filter(item => !!item)
    }, [task.State])

    const _getUsers = () => {
        return users && users.map((item) => {return {id: item.Id, name: item.DisplayName}})
    }

    const _lock = {
        executor: !taskController.fieldsEnable.form || !taskController.fieldsEnable.executor,
        state: !taskController.fieldsEnable.form || !taskController.fieldsEnable.state,
        dueDate: !taskController.fieldsEnable.form || !taskController.fieldsEnable.dueDate,
        comments: !taskController.fieldsEnable.form
    }

    return <div className="body__right-block">
        <Field component={Select} name={"ExecutorId"} label={"Испольнитель"} options={_getUsers()} disabled={_lock.executor} readOnly={_lock.executor}/>
        <Field component={Select} name={"State"} label={"Состояние"} options={_stateOptions} disabled={_lock.state} readOnly={_lock.state} required={true}/>
        <Field component={DatePicker} name={"DueDate"} label={"Дата исполнения"} disabled={_lock.dueDate} readOnly={_lock.dueDate}/>
        <Field component={TextBox} name={"LastComment"} label={"Комментарий"} disabled={_lock.comments} readOnly={_lock.comments}/>
        <CommentBlock task={task}/>
    </div>
}
