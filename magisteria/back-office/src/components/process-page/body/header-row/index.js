import React from "react"
import {Field} from "redux-form";
import {Select} from "../../../ui-kit";
import "./header-row.sass"
import {PROCESS_STATE} from "../../../../constants/states";

type HeaderRowProps = {
    lessons: Array,
    users: Array,
    isAdmin: boolean,
}

export default function HeaderRow(props: HeaderRowProps) {

    const {lessons, users, isAdmin} = props

    const _getStateOptions = () => {
        return Object.values(PROCESS_STATE).map(item => ({id: item.value, name: item.label}))
    }

    const _getUsers = () => {
        return users && users.map((item) => {return {id: item.Id, name: item.DisplayName}})
    }

    const _getLessons = () => {
        return lessons && lessons.map((item) => {return {id: item.Id, name: item.Name}})
    }

    return <div className="process-body__header-row">
        <Field component={Select} name={"LessonId"} label={"Лекция"} extClass={"_lesson-field"} options={_getLessons()} disabled={true} required={true}/>
        <Field component={Select} name={"State"} label={"Состояние"} extClass={"_state-field"} options={_getStateOptions()} required={true}/>
        <Field component={Select} name={"SupervisorId"} label={"Супервизор"} extClass={"_user-field"} options={_getUsers()} required={true} disabled={!isAdmin}/>
    </div>
}
