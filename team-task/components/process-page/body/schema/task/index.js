import React, {useCallback, useMemo, useRef,} from "react"
import "./task.sass"
import {getTaskState} from "../../../../../tools/tasks";
import moment from "moment";
import {TASK_STATE} from "../../../../../constants/states";
import ActionMenu from "./action-menu";

type TaskProps = {
    onClick: Function,
    onEditLinks: Function,
    onEdit: Function,
    onDelete: Function,
    onMenuButtonClick: Function,
    onAddNewTask: Function,
    onChangeTaskFinal: Function,
    onChangeTaskAuto: Function,
    active: boolean,
    isLast: boolean,
    menuTaskId: number,
    node: any,
    horizontalProcess: boolean,
}

export default function SchemaTask(props: TaskProps) {
    const {node, active, onClick, horizontalProcess, menuTaskId, isLast} = props;
    const taskRef = useRef(null)

    const editLinks = useCallback(() => {
        if (props.onEditLinks) {
            props.onEditLinks(node.id)
        }
    }, [menuTaskId])

    const editTask = useCallback(() => {
        if (props.onEdit) {
            props.onEdit(node.id)
        }
    }, [menuTaskId, active])

    const deleteTask = useCallback(() => {
        if (props.onDelete) {
            props.onDelete(node.id)
        }
    }, [menuTaskId])

    const addNewTask = useCallback(() => {
        if (props.onAddNewTask) {
            props.onAddNewTask(node.id)
        }
    }, [node])

    const setTaskFinal = useCallback(() => {
        if (props.onChangeTaskFinal) {
            props.onChangeTaskFinal(node.id, !node.isFinal)
        }
    }, [node])

    const setTaskAuto = useCallback(() => {
        if (props.onChangeTaskAuto) {
            props.onChangeTaskAuto(node.id, !node.isAutomatic)
        }
    }, [node])



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

    const onTaskClick = (e) => {
        if (e.target.closest(".task-button__add-new-task")) return

        if (onClick) {
            onClick(node.id)
        }
    }

    const taskClass = useMemo(() => {
        return 'process-schema__task unselectable' + (
            node.disabled ? ' _disabled' : (active ? ' _active' : '') + (state.isExpired ? ' _expired' : '')
        )
    }, [node, active])

    const onMenuButtonClick = (e) => {
        if (props.onMenuButtonClick) {
            e.stopPropagation();
            props.onMenuButtonClick(node.id)
        }
    }

    const menuPosition = useMemo(() => {
        if (menuTaskId === node.id) {
            return {
                left: (isLast && horizontalProcess  ? 0 : taskRef.current.offsetWidth + 10) + taskRef.current.offsetLeft,
                top: taskRef.current.offsetTop}
        }
    }, [menuTaskId])

    return node ?
        <React.Fragment>
            <div className="process-schema__cell" style={style}>
                <div className={taskClass}
                     ref={taskRef}
                     id={"js-task_" + node.id}
                     onClick={onTaskClick}
                     onDoubleClick={editTask}>
                    <div className="task__first-row">
                        <div className="task__id _grey50">{node.id}</div>
                        { node.dueDate && <div className="task__due-date _black">{(new Date(node.dueDate)).toLocaleDateString("ru-RU")}</div> }
                        <div className={'task__action-button'} onMouseDown={onMenuButtonClick}>
                            <div className='point'/>
                            <div className='point'/>
                            <div className='point'/>
                        </div>
                    </div>
                    <div className="task__name _black">{node.name}</div>
                    <div className="task__executor _black">{node.executorName ? node.executorName : ""}</div>
                    <div className={`task-state ${state.css}`}>{state.caption}</div>
                    { !node.disabled && <button className='task-button__add-new-task' onClick={addNewTask}/> }
                    <div className='task__ext-info'>
                        { node.isFinal && <div className='ext-info__item _final'>Конечная</div> }
                        { node.isAutomatic && <div className='ext-info__item _auto'>Авто</div> }
                    </div>
                </div>
                {menuTaskId === node.id && <ActionMenu position={menuPosition}
                                                       isFinal={node.isFinal}
                                                       isAutomatic={node.isAutomatic}
                                                       onEdit={editTask}
                                                       onFinalClick={setTaskFinal}
                                                       onAutoClick={setTaskAuto}
                                                       onDelete={deleteTask}
                                                       onEditLinks={editLinks}/>}
            </div>
        </React.Fragment>
        :
        null
}
