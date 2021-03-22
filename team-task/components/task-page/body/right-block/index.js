import React, {useEffect, useRef, useMemo} from "react"
import {Field} from "redux-form";
import {TextBox, Select, DatePicker} from "../../../ui-kit";
import CommentBlock from "./сomment-block";
import "./right-block.sass"
import {TASK_STATE} from "../../../../constants/states";

type TaskBodyProps = {
    users: Array,
    task: any,
    isSupervisor: boolean,
}

export default function RightBlock(props: TaskBodyProps) {
    const {task, users, isSupervisor} = props

    const _getStateOptions = () => {
        return Object.values(TASK_STATE).map(item => ({id: item.value, name: item.label}))
    }

    const _getUsers = () => {
        return users && users.map((item) => {return {id: item.Id, name: item.DisplayName}})
    }

    return <div className="body__right-block">
        <Field component={Select} name={"ExecutorId"} label={"Испольнитель"} options={_getUsers()} disabled={!isSupervisor} readOnly={!isSupervisor}/>
        <Field component={Select} name={"State"} label={"Состояние"} options={_getStateOptions()}/>
        <Field component={DatePicker} name={"DueDate"} label={"Дата исполнения"}/>
        <Field component={TextBox} name={"LastComment"} label={"Комментарий"}/>
        <CommentBlock task={task}/>
    </div>
}
