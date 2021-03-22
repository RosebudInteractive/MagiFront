import React from "react"
import "./schema.sass"

type SchemaProps = {
    Lessons: Array,
    States: Array,
    Users: Array,
    onAddTask: Function,
}

export default function Schema(props: SchemaProps) {

    const _onAdd = (e) => {
        if (props.onAddTask) {
            props.onAddTask(e)
        }
    }

    return <div className="process-body__schema">
        <h6 className="process-schema__title">Схема процесса</h6>
        <div className="process-schema__canvas"/>
        <button className="process-schema__add-task-button orange-button small-button" onClick={_onAdd}>Добавить задачу</button>
    </div>
}
