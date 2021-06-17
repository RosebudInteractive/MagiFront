import React, {useMemo, useRef,} from "react"
import "./task.sass"
import {getTaskState} from "../../../../../tools/tasks";
import moment from "moment";
import {TASK_STATE} from "../../../../../constants/states";


type TaskProps = {
    onClick: Function,
    onEditLinks: Function,
    onEdit: Function,
    onDelete: Function,
    onAddNewTask: Function,
    active: boolean,
    node: any,
    horizontalProcess: boolean,
}

export default function SchemaTask(props: TaskProps) {

    const {node, active, onClick, horizontalProcess} = props

    const _onEditLinks = () => {
        if (props.onEditLinks) {
            props.onEditLinks(node.id)
        }
    }

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

    const _onAddNewTask = () => {
        if (props.onAddNewTask) {
            props.onAddNewTask(node.id)
        }
    }


    const style = useMemo(() => {return {
        width: "100%",
        height: "100%",
        gridColumnStart: horizontalProcess ? node.weight + 1 : node.rowNumber + 1,
        gridRowStart: horizontalProcess ?  node.rowNumber + 1 : node.weight + 1,
    }}, [node, horizontalProcess])

    const state = useMemo(() => {
        const isExpired = node && (node.state !== TASK_STATE.DONE.value) && moment(node.dueDate).isBefore(moment()),
            _state = getTaskState(node.state)

        return isExpired ? { isExpired, css: "_expired", caption: _state.caption } : { isExpired, ..._state}
    }, [node])

    const _onClick = (e) => {
        if (e.target.closest(".task__button") || e.target.closest(".task-button_add-new-task")) return

        if (onClick) {
            onClick(node.id)
        }
    }

    return node ?
        <div className="process-schema__cell" style={style}>
            <div className={"process-schema__task" + (active ? " _active" : "") + (state.isExpired ? " _expired" : "")}
                 id={"js-task_" + node.id}
                 onClick={_onClick}
                 onDoubleClick={_onEdit}>
                <div className="task__first-row">
                    <div className="task__id _grey50">{node.id}</div>
                    { node.dueDate && <div className="task__due-date _black">{(new Date(node.dueDate)).toLocaleDateString("ru-RU")}</div> }
                </div>
                <div className="task__name _black">{node.name}</div>
                <div className="task__executor _black">{node.executorName ? node.executorName : ""}</div>
                <div className={`task-state ${state.css}`}>{state.caption}</div>
                <div className="task__buttons-block">
                    <button className='task__button _link' onClick={_onEditLinks}/>
                    <button className='task__button _edit' onClick={_onEdit}/>
                    <button className='task__button _delete' onClick={_onDelete}/>
                </div>
                <button className='task-button_add-new-task' onClick={_onAddNewTask}/>
            </div>
        </div>
        :
        null
}
