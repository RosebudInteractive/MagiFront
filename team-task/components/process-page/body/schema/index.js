import React, {useEffect, useMemo, useRef, useState} from "react"
import "./schema.sass"
import {LineArrow} from "../../../ui-kit";
import {ARROW_TYPE} from "../../../ui-kit/line-arrow";
import SchemaTask from "./task";
import RotateIcon from "tt-assets/svg/rotate.svg"


type SchemaProps = {
    onAddTask: Function,
    onAddTaskWithLink: Function,
    onEditTaskLinks: Function,
    onEditTask: Function,
    onDeleteTask: Function,
    onSetActiveTask: Function,
    onChangeRotation: Function,
    tree: any,
    activeTaskId: ?number,
    horizontalProcess: boolean,
}

export default function Schema(props: SchemaProps) {

    const {tree, activeTaskId, horizontalProcess} = props

    const [active, setActive] = useState(0),
        [scrollPosition, setScrollPosition] = useState(0),
        [mounted, setMounted] = useState(false)

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
                    gridTemplateRows: `repeat(${tree.rowCount}, 1fr)`
                }
                :
                {
                    "display": "grid",
                    gridTemplateColumns: `repeat(${tree.rowCount}, 1fr)`,
                    gridTemplateRows: `repeat(${tree.colCount}, 1fr)`
                }
        } else {
            return {
                "display": "block",
            }
        }
    }, [tree, horizontalProcess])

    useEffect(() => {
        if (active !== activeTaskId) {
            setActive(activeTaskId)

            if (activeTaskId && $("#js-task_" + activeTaskId).length) {
                setTimeout(() => {
                    $("#js-task_" + activeTaskId)[0].scrollIntoView({block: "center",  inline: "center",  behavior: "auto"})
                }, 300)

            }
        }
    }, [activeTaskId, tree])

    // useEffect(() => {
    //     if (active && $("#js-task_" + active).length) {
    //         setTimeout(() => {
    //             $("#js-task_" + active)[0].scrollIntoView({block: "center",  inline: "center",  behavior: "auto"})
    //         }, 300)
    //
    //     }
    // }, [active, tree])

    const toggleElems = () => {
        if (canvas && canvas.current) {
            setScrollPosition(canvas.current.scrollLeft + 1)
            setScrollPosition(canvas.current.scrollLeft)
        }
    }

    useEffect(() => {
        $(window).bind("toggle-elements-visible", toggleElems)

        return () => {
            $(window).unbind("toggle-elements-visible", toggleElems)
        }
    })

    const getCells = () => {
        if (tree) {
            return Object.values(tree.nodes).map((item, index) => {
                const _active = active === item.id

                return <SchemaTask horizontalProcess={props.horizontalProcess} onClick={onTaskClick} onEdit={editTask} onDelete={deleteTask} onEditLinks={editTaskLinks} onAddNewTask={addTaskWithLink}
                                   active={_active} node={item} key={index}/>
            })
        } else {
            return null
        }
    }

    const onTaskClick = (taskId) => {
        setActive(taskId)
        props.onSetActiveTask(taskId)
    }

    const editTaskLinks = (taskId) => { if (props.onEditTaskLinks) {props.onEditTaskLinks(taskId)} }

    const editTask = (taskId) => { if (props.onEditTask) {props.onEditTask(taskId)} }

    const deleteTask = (taskId) => { if (props.onDeleteTask) {props.onDeleteTask(taskId)} }

    const addTaskWithLink = (taskId) => { if (props.onAddTaskWithLink) {props.onAddTaskWithLink(taskId)} }

    const getLines = () => {
        if (tree && tree.lines && tree.lines.length) {
            return tree.lines.map((item, index) => {
                const type = (item.from === active) ? ARROW_TYPE.OUT :
                    (item.to === active) ? ARROW_TYPE.IN : ARROW_TYPE.DEFAULT

                return <LineArrow horizontalProcess={props.horizontalProcess} source={"js-task_" + item.from} dest={"js-task_" + item.to} type={type} scrollPosition={scrollPosition} key={index}/>
            })
        } else {
            return null
        }
    }


    useEffect(() => {
        setTimeout(() => {setMounted(true)}, 300)
        canvas.current.addEventListener('scroll', onCanvasScroll);

        return () => {
            canvas.current.removeEventListener('scroll', onCanvasScroll);
        }
    }, [])

    const onCanvasScroll = (e) => { setScrollPosition(e.target.scrollLeft) }

    const onClick = (e) => {
        if (!e.target.closest(".process-schema__task")) {
            setActive(0)
            props.onSetActiveTask(null)
        }
    }

    const changeRotation = () => {
        if (props.onChangeRotation) {
            props.onChangeRotation()
        }
    }

    return <div className="process-body__schema" onClick={onClick}>
        {/*<div className="schema__left-screen"/>*/}
        {/*<div className="schema__right-screen"/>*/}
        <h6 className="process-schema__title">
            <span>Схема процесса</span>
            <button className="process-schema__rotate-button" onClick={changeRotation}>
                <RotateIcon/>
            </button>
        </h6>

            <div className="process-schema__canvas-background" ref={canvas}>
                <div className="process-schema__canvas" style={style}>
                    {getCells()}
                    {mounted && getLines()}
                </div>
            </div>

        <button className="process-schema__add-task-button orange-button small-button" onClick={_onAdd}>Добавить
            задачу
        </button>
    </div>
}
