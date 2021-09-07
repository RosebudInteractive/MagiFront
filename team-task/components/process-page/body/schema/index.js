import React, {useCallback, useEffect, useMemo, useRef, useState} from "react"
import "./schema.sass"
import LineArrow, {ARROW_TYPE} from "./line-arrow";
import SchemaTask from "./task";
import RotateIcon from "tt-assets/svg/rotate.svg"
import type {Tree} from "../../../../types/process";
import {TASK_STATE} from "../../../../constants/states";
import { Xwrapper, useXarrow, } from 'react-xarrows';


type SchemaProps = {
    onAddTask: Function,
    onAddTaskWithLink: Function,
    onEditTaskLinks: Function,
    onEditTask: Function,
    onDeleteTask: Function,
    onSetActiveTask: Function,
    onChangeRotation: Function,
    onUpdateProcessTask: Function,
    onDeleteDependence: Function,
    onUpdateDependence: Function,
    tree: Tree,
    activeTaskId: ?number,
    horizontalProcess: boolean,
}

export default function Schema(props: SchemaProps) {

    const {tree, activeTaskId, horizontalProcess} = props

    const [activeTask, setActiveTask] = useState(0),
        [activeArrow, setActiveArrow] = useState(0),
        [actionMenuTaskId, setActionMenuTaskId] = useState(null);

    const updateXarrow = useXarrow();

    const canvas = useRef()

    const _onAdd = (e) => {
        if (props.onAddTask) {
            props.onAddTask(e)
        }
    }

    const style = useMemo(() => {
        if (tree) {
            return props.horizontalProcess ? {
                    "display": "grid",
                    gridTemplateColumns: `repeat(${tree.colCount}, 1fr)`,
                    gridTemplateRows: `repeat(${tree.rowCount}, 1fr)`,
                    width: 'fit-content'
                }
                :
                {
                    "display": "grid",
                    gridTemplateColumns: `repeat(${tree.rowCount}, 1fr)`,
                    gridTemplateRows: `repeat(${tree.colCount}, 1fr)`,
                }
        } else {
            return {
                "display": "block",
            }
        }
    }, [tree, horizontalProcess])

    useEffect(() => {
        if (activeTask !== activeTaskId) {

            if (activeTaskId && $("#js-task_" + activeTaskId).length) {
                setTimeout(() => {
                    setActiveTask(activeTaskId)
                    _scrollToTask(activeTaskId)
                }, 0)
            }
        }
    }, [activeTaskId, tree, horizontalProcess]);

    useEffect(updateXarrow, [tree])

    const _scrollToTask = (taskId) => {
        if (horizontalProcess) {
            const _container = $("#schema_container"),
                _task = $("#js-task_" + taskId).parent()

            const _scrollLeft = _task.offset().left - _container.width() + _task.outerWidth() / 3,
                _scrollTop = _task.offset().top - _container.height() + _task.outerHeight() / 2

            _scrollLeft > 1 && _container.scrollLeft(_scrollLeft); //todo think about it or not
            _container.scrollTop(_scrollTop)
        } else {
            setTimeout(() => {
                $("#js-task_" + taskId)[0].scrollIntoView({block: "center",  inline: "center",  behavior: "auto"})
            }, 0)
        }
    };

    const changeTaskAuto = useCallback((id, value) => {
        props.onUpdateProcessTask(id, {IsAutomatic: value})
        setActionMenuTaskId(null)
    }, [])

    const changeTaskFinal = useCallback((id, value) => {
        props.onUpdateProcessTask(id, {IsFinal: value})
        setActionMenuTaskId(null)
    }, [])

    const onMenuButtonClick = useCallback((taskId) => {
        if (actionMenuTaskId !== taskId) {
            setActionMenuTaskId(taskId)
        } else {
            setActionMenuTaskId(null)
        }
    }, [actionMenuTaskId])

    const onTaskClick = useCallback((taskId) => {
        if (activeTask !== taskId) {
            setActiveTask(taskId);
        }
        props.onSetActiveTask(taskId);
    }, [activeTask])

    const editTaskLinks = useCallback(() => {
        if (props.onEditTaskLinks && actionMenuTaskId) {
            props.onEditTaskLinks(actionMenuTaskId)
            setActionMenuTaskId(null)
        }
    }, [actionMenuTaskId])

    const editTask = useCallback(() => {
        const selectedTaskId = actionMenuTaskId || activeTask

        if (props.onEditTask && selectedTaskId) {
            props.onEditTask(selectedTaskId)
            actionMenuTaskId && setActionMenuTaskId(null)
        }
    }, [actionMenuTaskId, activeTask])

    const deleteTask = useCallback(() => {
        if (props.onDeleteTask && actionMenuTaskId) {
            props.onDeleteTask(actionMenuTaskId)
            setActionMenuTaskId(null)
        }
    }, [actionMenuTaskId])

    const addTaskWithLink = (taskId) => { if (props.onAddTaskWithLink) {props.onAddTaskWithLink(taskId)} }

    const taskCells = useMemo(() => {
        if (tree) {
            return Object.values(tree.nodes).map((item) => {
                const _active = activeTask === item.id,
                    isRight = horizontalProcess
                        ? (item.weight === tree.colCount - 1)
                        : (item.rowNumber === tree.rowCount - 1);

                return <SchemaTask horizontalProcess={horizontalProcess}
                                   onClick={onTaskClick}
                                   menuTaskId={actionMenuTaskId}
                                   onEdit={editTask}
                                   onEditLinks={editTaskLinks}
                                   onDelete={deleteTask}
                                   onMenuButtonClick={onMenuButtonClick}
                                   onChangeTaskAuto={changeTaskAuto}
                                   onChangeTaskFinal={changeTaskFinal}
                                   onAddNewTask={addTaskWithLink}
                                   active={_active}
                                   node={item}
                                   isLast={isRight}
                                   key={item.id}/>
            })
        } else {
            return null
        }
    }, [tree, activeTask, horizontalProcess, actionMenuTaskId,
        onTaskClick, editTask, editTaskLinks, deleteTask, onMenuButtonClick, changeTaskAuto, changeTaskFinal])

    const arrows = useMemo(() => {
        if (tree && tree.lines && tree.lines.length) {
            return tree.lines.map((item,) => {
                const type = (item.from === activeTask) ?
                    ARROW_TYPE.OUT
                    :
                    (item.to === activeTask) ?
                        ARROW_TYPE.IN
                        :
                        ARROW_TYPE.DEFAULT;

                return <LineArrow start={"js-task_" + item.from}
                                  end={"js-task_" + item.to}
                                  type={type}
                                  item={item}
                                  onDeleteArrow={props.onDeleteDependence}
                                  onUpdateArrow={props.onUpdateDependence}
                                  selected={activeArrow}
                                  setSelected={setActiveArrow}
                                  key={item.id}/>
            })
        } else {
            return null
        }
    }, [tree, activeTask, activeArrow])

    const keyPressHandler = useCallback((e) => {
        if(e.key === "Escape") {
            if (activeArrow) setActiveArrow(null)
            if (actionMenuTaskId) setActionMenuTaskId(null)
        }
    }, [activeArrow, actionMenuTaskId])

    useEffect(() => {
        document.addEventListener('keydown', keyPressHandler);

        return () => {
            document.removeEventListener('keydown', keyPressHandler);
        }
    }, [activeArrow, actionMenuTaskId])

    useEffect(() => {
        canvas.current.addEventListener('scroll', updateXarrow);

        return () => {
            canvas.current.removeEventListener('scroll', updateXarrow);
        }
    }, [])

    useEffect(() => {
        if (tree && !props.activeTaskId) {
            const _firstActiveTask = Object.values(tree.nodes).find(task => task.state !== TASK_STATE.DONE.value)

            if (_firstActiveTask) {
                _scrollToTask(_firstActiveTask.id)
            }
        }
    }, [tree, horizontalProcess])

    const onClick = (e) => {
        const jQcanvas = $(canvas.current)

        if ((jQcanvas.outerHeight() + jQcanvas.offset().top - 8) <= e.clientY ){
            return true;
        }

        if (!e.target.closest(".process-schema__task")) {
            setActiveTask(0)
            props.onSetActiveTask(null)
        }

        if (!(e.target.closest(".process-schema__x-arrow") || e.target.closest(".x-arrow__tooltip"))) {
            if (activeArrow) setActiveArrow(null)
        }

        if (!e.target.closest(".task__action-menu")) {
            if (actionMenuTaskId) setActionMenuTaskId(null)
        }
    }

    const changeRotation = () => {
        if (props.onChangeRotation) {
            props.onChangeRotation()
        }
    }

    return <div className="process-body__schema" onMouseDown={onClick}>
        <h6 className="process-schema__title">
            <span>Схема процесса</span>
            <button className="process-schema__rotate-button" onClick={changeRotation}>
                <RotateIcon/>
            </button>
        </h6>
        <Xwrapper>
            <div className="process-schema__canvas-background _with-custom-scroll" id="schema_container" ref={canvas}>
                <div className="process-schema__canvas" style={style}>
                    {taskCells}
                    {arrows}
                </div>
            </div>
        </Xwrapper>
        <button className="process-schema__add-task-button orange-button small-button" onClick={_onAdd}>Добавить
            задачу
        </button>
    </div>
}
