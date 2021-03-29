import React, {useMemo, useRef, useState} from "react"
import "./task.sass"
import {getTaskState} from "../../../../../tools/tasks";


type TaskProps = {
    onClick: Function,
    onEdit: Function,
    onDelete: Function,
    active: boolean,
    node: any,
}

export default function SchemaTask(props: TaskProps) {

    const {node, active, onClick,} = props


    const _onEdit = () => {
        if (props.onEdit) {
            props.onEdit(node.id)
        }
    }

    const _onDelete = () => {
        if (props.onDelete) {
            props.onDelete(node.id)
        }
    }


    const style = useRef({
        width: "100%",
        height: "100%",
        gridColumnStart: node.weight + 1,
        gridRowStart: node.rowNumber + 1,
    })

    const _state = useRef(getTaskState(node.state))

    const _onClick = () => {
        if (onClick) {
            onClick(node.id)
        }
    }

    return node ?
        <div className="process-schema__cell" style={style.current}>
            <div className={"process-schema__task" + (active ? " _active" : "")} id={"js-task_" + node.id} onClick={_onClick}>
                <div className="task__first-row">
                    <div className="task__id font-body-s _grey50">{node.id}</div>
                    <div className="task__due-date font-body-s _black">{(new Date(node.dueDate)).toLocaleDateString("ru-RU")}</div>
                </div>
                <div className="task__name font-h7 _black">{node.name}</div>
                <div className="task__executor font-body-m _black">{node.executorName ? node.executorName : ""}</div>
                <div className={`task-state ${_state.current.css}`}>{_state.current.caption}</div>
                <div className="task__buttons-block">
                    <button className='task__button _link'/>
                    <button className='task__button _edit' onClick={_onEdit}/>
                    <button className='task__button _delete' onClick={_onDelete}/>
                </div>
            </div>
        </div>
        :
        null
}
