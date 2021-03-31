import React, {useEffect, useMemo, useRef, useState} from "react"
import "./schema.sass"
import {LineArrow} from "../../../ui-kit";
import {ARROW_TYPE} from "../../../ui-kit/line-arrow";
import SchemaTask from "./task";


type SchemaProps = {
    onAddTask: Function,
    onEditTaskLinks: Function,
    onEditTask: Function,
    onDeleteTask: Function,
    onSetActiveTask: Function,
    tree: any,
}

export default function Schema(props: SchemaProps) {

    const {tree} = props

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
            return {
                "display": "grid",
                gridTemplateColumns: `repeat(${tree.colCount}, 1fr)`,
                gridTemplateRows: `repeat(${tree.rowCount}, 1fr)`
            }
        } else {
            return {
                "display": "block",
            }
        }
    }, [tree])

    const getCells = () => {
        if (tree) {
            return Object.values(tree.nodes).map((item, index) => {
                return <SchemaTask onClick={onTaskClick} onEdit={editTask} onDelete={deleteTask} onEditLinks={editTaskLinks}
                                   active={active === item.id} node={item} key={index}/>
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

    const getLines = () => {
        if (tree && tree.lines && tree.lines.length) {
            return tree.lines.map((item, index) => {
                const type = (item.from === active) ? ARROW_TYPE.OUT :
                    (item.to === active) ? ARROW_TYPE.IN : ARROW_TYPE.DEFAULT

                return <LineArrow source={"js-task_" + item.from} dest={"js-task_" + item.to} type={type} scrollPosition={scrollPosition} key={index}/>
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

    return <div className="process-body__schema">
        <div className="schema__left-screen"/>
        <div className="schema__right-screen"/>
        <h6 className="process-schema__title">Схема процесса</h6>
        <div className="process-schema__canvas" style={style} ref={canvas}>
            {getCells()}
            {mounted && getLines()}
        </div>
        <button className="process-schema__add-task-button orange-button small-button" onClick={_onAdd}>Добавить
            задачу
        </button>
    </div>
}
