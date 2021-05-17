import React from "react"
import {Field} from "redux-form";
import {TextBox, Select, DatePicker} from "../../../ui-kit";
import CommentBlock from "./сomment-block";
import "./right-block.sass"
import {TASK_STATE} from "../../../../constants/states";
import {USER_ROLE} from "../../../../constants/common";

type TaskBodyProps = {
    users: Array,
    task: any,
    isSupervisor: boolean,
    userRole: string
}

export default function RightBlock(props: TaskBodyProps) {
    const {task, users, isSupervisor, userRole, isReadOnly} = props

    const _getStateOptions = () => {
        return Object.values(TASK_STATE).map(item => ({id: item.value, name: item.label}))
    }

    const _getUsers = () => {
        return users && users.map((item) => {return {id: item.Id, name: item.DisplayName}})
    }

    const _isUserRole = userRole === USER_ROLE.PMU

    return <div className="body__right-block">
        <Field component={Select} name={"ExecutorId"} label={"Испольнитель"} options={_getUsers()} disabled={!isSupervisor} readOnly={!isSupervisor}/>
        <Field component={Select} name={"State"} label={"Состояние"} options={_getStateOptions()} disabled={isReadOnly} readOnly={isReadOnly}/>
        <Field component={DatePicker} name={"DueDate"} label={"Дата исполнения"} disabled={_isUserRole} readOnly={_isUserRole}/>
        <Field component={TextBox} name={"LastComment"} label={"Комментарий"}/>
        <CommentBlock task={task}/>
    </div>
}
