import React, {useEffect, useState} from "react"
import {connect} from 'react-redux';
import {linkEditorVisibleSelector, taskIdSelector, closeTaskLinkEditor} from "tt-ducks/process-task";
import {saveDependencies} from "tt-ducks/task";
import {bindActionCreators} from "redux";
import {processSelector} from "tt-ducks/process";
import {AvailableTask, DependingTask} from "./task-items";
import "./task-link-editor.sass"

const DEP_STATE = {
    NONE: "NONE",
    ADDED: "ADDED",
    DELETED: "DELETED",
}

function TaskLinksEditor(props) {
    const {taskId, process, actions} = props
    const [deps, setDeps] = useState([])
    const [availables, setAvailables] = useState([])
    const [tasks, setTasks] = useState({})
    const [hasChanges, setHasChanges] = useState(false)

    useEffect(() => {
        if (process && process.Tasks && process.Deps) {
            const _tasks = {}
            if (process.Tasks) {
                process.Tasks.map((item) => { _tasks[item.Id] = {name: item.Name} })
            }

            setInitDeps(_tasks)
            setTasks(_tasks)
        }
    }, [taskId, process])

    const setInitDeps = (tasks) => {
        const _deps = process.Deps
            .map((item) => {
                return item.DepTaskId === taskId ? {
                    id: item.Id,
                    taskId: item.TaskId,
                    name: tasks[item.TaskId].name,
                    state: DEP_STATE.NONE
                } : null
            })
            .filter(item => item)

        setDeps(_deps)
    }

    useEffect(() => {
        const _available = []

        Object.entries(tasks).forEach(([taskId, data]) => {
            if (props.taskId === +taskId) return

            const _notInDeps = deps.every((dep) => { return (dep.taskId !== +taskId) || ((dep.taskId === +taskId) && dep.state === DEP_STATE.DELETED)})
            if (_notInDeps) {
                _available.push({taskId: +taskId, name: data.name})
            }
        })

        setAvailables(_available)

        const _hasChanges = deps.some(item => item.state !== DEP_STATE.NONE)
        setHasChanges(_hasChanges)
    }, [deps])

    const getAvailableTasks = () => {
        return availables.map((item, index) => {
            return <AvailableTask id={item.taskId} name={item.name} onClick={addTask} key={index}/>
        })
    }

    const getDependingTasks = () => {
        return deps.map((item, index) => {
            return item.state !== DEP_STATE.DELETED && <DependingTask id={item.taskId} name={item.name} onClick={onRemoveTask} key={index}/>
        })
    }

    const addTask = (taskId) => {
        const _deps = [...deps]

        const _dep = _deps.find(item => item.taskId === taskId)

        if (_dep) {
            if (_dep.state === DEP_STATE.DELETED) {
                _dep.state = DEP_STATE.NONE
            }
        } else {
            _deps.push({
                id: null,
                taskId: taskId,
                name: tasks[taskId].name,
                state: DEP_STATE.ADDED
            })
        }

        setDeps(_deps)
    }

    const onRemoveTask = (taskId) => {
        const _depIndex = deps.findIndex(item => item.taskId === taskId)

        if (_depIndex !== -1) {
            let _deps = [...deps]

            const _dep = _deps[_depIndex]
            if (_dep.state === DEP_STATE.NONE) {
                _dep.state = DEP_STATE.DELETED
            } else {
                _deps.splice(_depIndex, 1)
            }

            setDeps(_deps)
        }
    }

    const cancelChanges = () => {
        setInitDeps(tasks)
    }

    const applyChanges = () => {
        props.actions.saveDependencies({taskId, deps})
    }

    return props.editorVisible ?
        <div className="modal-form tak-editor__modal-form">
            <div className="tak-editor__modal-wrapper">
                <div className="task-links-editor form">
                    <h6 className="task-links-editor__title _grey100">{`Выбор зависимостей задачи №${taskId}`}</h6>
                    <div className="task-links-editor__tasks">
                        <div className="task-links__available-tasks _tasks-column">
                            {getAvailableTasks()}
                        </div>
                        <div className="task-links__depending-tasks _tasks-column">
                            {getDependingTasks()}
                        </div>
                    </div>
                    <div className="bottom-buttons">
                        <button className="orange-button big-button _apply" disabled={!hasChanges} onClick={applyChanges}>Применить</button>
                        <button className="grey-button big-button _cancel" disabled={!hasChanges} onClick={cancelChanges}>Отмена</button>
                    </div>
                    <button type="button" className="modal-form__close-button"
                            onClick={actions.closeTaskLinkEditor}>Закрыть
                    </button>
                </div>
            </div>
        </div>
        :
        null
}

const mapState2Props = (state) => {
    return {
        taskId: taskIdSelector(state),
        process: processSelector(state),
        editorVisible: linkEditorVisibleSelector(state)
    }
}

const mapDispatch2Props = (dispatch) => {
    return {
        actions: bindActionCreators({saveDependencies, closeTaskLinkEditor}, dispatch)
    }
}

export default connect(mapState2Props, mapDispatch2Props)(TaskLinksEditor)


