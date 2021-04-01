import React, {useMemo, useRef,} from "react"
import "./task.sass"
import {getTaskState} from "../../../../../tools/tasks";
import moment from "moment";


type TaskProps = {
    onClick: Function,
    onEditLinks: Function,
    onEdit: Function,
    onDelete: Function,
    active: boolean,
    node: any,
}

export default function SchemaTask(props: TaskProps) {

    const {node, active, onClick,} = props

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


    const style = useMemo(() => {return {
        width: "100%",
        height: "100%",
        gridColumnStart: node.weight + 1,
        gridRowStart: node.rowNumber + 1,
    }}, [node])

    const state = useMemo(() => {
        const isExpired = node && moment(node.dueDate).isBefore(moment())
        return isExpired ? { isExpired, css: "_expired", caption: "Просрочено" } : { isExpired, ...getTaskState(node.state)}
    }, [node])

    const _onClick = () => {
        if (onClick) {
            onClick(node.id)
        }
    }

    return node ?
        <div className="process-schema__cell" style={style}>
            <div className={"process-schema__task" + (active ? " _active" : "") + (state.isExpired ? " _expired" : "")} id={"js-task_" + node.id} onClick={_onClick}>
                <div className="task__first-row">
                    <div className="task__id font-body-s _grey50">{node.id}</div>
                    { node.dueDate && <div className="task__due-date font-body-s _black">{(new Date(node.dueDate)).toLocaleDateString("ru-RU")}</div> }
                </div>
                <div className="task__name font-h7 _black">{node.name}</div>
                <div className="task__executor font-body-m _black">{node.executorName ? node.executorName : ""}</div>
                <div className={`task-state ${state.css}`}>{state.caption}</div>
                <div className="task__buttons-block">
                    <button className='task__button _link' onClick={_onEditLinks}/>
                    <button className='task__button _edit' onClick={_onEdit}/>
                    <button className='task__button _delete' onClick={_onDelete}/>
                </div>
            </div>
        </div>
        :
        null
}
