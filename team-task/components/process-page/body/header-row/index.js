import React from "react"
import {Field} from "redux-form";
import {Select} from "../../../ui-kit";
import "./header-row.sass"
import {PROCESS_STATE} from "../../../../constants/states";

type HeaderRowProps = {
    lessons: Array,
    users: Array,
}

export default function HeaderRow(props: HeaderRowProps) {

    const {lessons, users} = props

    const _getStateOptions = () => {
        return Object.values(PROCESS_STATE).map(item => ({id: item.value, name: item.label}))
    }

    const _getUsers = () => {
        return users && users.map((item) => {return {id: item.Id, name: item.DisplayName}})
    }

    const _getLessons = () => {
        return null
    }

    return <div className="process-body__header-row">
        <Field component={Select} name={"LessonId"} label={"Лекция"} extClass={"_lesson-field"}/>
        <Field component={Select} name={"State"} label={"Состояние"} extClass={"_state-field"} options={_getStateOptions()}/>
        <Field component={Select} name={"SupervisorId"} label={"Супервизор"} extClass={"_user-field"} options={_getUsers()}/>
    </div>
}
