import React, {useEffect, useRef, useMemo, useState} from "react"
import {compose} from "redux"
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {useParams} from "react-router-dom"
import {
    getProcess,
    saveProcess,
    goBack,
    addElement,
    updateElement,
    deleteElement,
    processSelector,
    supervisorsSelector,
    editorsSelector,
    elementsSelector,
    lessonsSelector,
    fetchingSelector,
} from "tt-ducks/process";
import {getFormValues, isDirty, isValid, reduxForm,} from "redux-form";
import {hasSupervisorRights, userSelector,} from "tt-ducks/auth";
import {hideSideBarMenu, showSideBarMenu,} from "tt-ducks/app";
import {deleteTask,} from "tt-ducks/task";
import ProcessHeader from "../../components/process-page/header";
import ProcessBody from "../../components/process-page/body";
import {UpdatingProcess} from "../../types/process"
import {buildTree} from "./functions";
import {ModalTaskEditor} from "../task-page";
import type {ProcessTask} from "../../types/task";

const EDITOR_NAME = "PROCESS_EDITOR"

function ProcessEditor(props) {
    const {actions, process, fetching, hasChanges, editorValues,} = props

    const params = useParams()

    const tree = useRef()

    const [currentTask, setCurrentTask] = useState(null)

    useEffect(() => {
        actions.hideSideBarMenu()
        actions.getProcess(params.processId)

        return () => {
            actions.showSideBarMenu()
        }
    }, [])

    useEffect(() => {
        if (process) {
            const _object = {
                Name: process.Name,
                State: process.State,
                SupervisorId: process.Supervisor.Id,
                LessonId: process.Lesson.Id,
            }

            Object.keys(process.ProcessFields).forEach((field) => {
                _object[field] = process[field]
            })

            props.initialize(_object)

            tree.current = buildTree(process)
        }
    }, [process])

    const _save = () => {
        const _value: UpdatingProcess = {
            Id: process.Id,
            Name: editorValues.Name,
            State: +editorValues.State,
            SupervisorId: +editorValues.SupervisorId,
            DueDate: process.DueDate,
            LessonId: +editorValues.LessonId,
        }

        Object.keys(process.ProcessFields).forEach((field) => {
            _value[field] = editorValues[field]
        })

        actions.saveProcess(_value)
    }

    const _back = () => {
        actions.goBack()
    }

    const onEditTask = (taskId) => {
        setCurrentTask(taskId)
    }

    const onAddTask = () => {
        setCurrentTask(-1)
    }

    const onDeleteTask = (taskId) => {
        const data: ProcessTask = {taskId: taskId, processId: process.Id}
        actions.deleteTask(data)
    }

    const onCloseTaskEditor = () => {
        setCurrentTask(null)
    }

    return !fetching && process &&
        <form className="process-editor-page form" onSubmit={e => e.preventDefault()}>
            <ProcessHeader hasChanges={hasChanges} state={process.State} onSave={_save} onBack={_back}/>
            <ProcessBody process={process}
                         tree={tree.current}
                         supervisors={props.supervisors}
                         editors={props.editors}
                         elements={props.elements}
                         lessons={props.lessons}
                         hasChanges={hasChanges}
                         onAddElement={actions.addElement}
                         onUpdateElement={actions.updateElement}
                         onDeleteElement={actions.deleteElement}
                         onAddTask={onAddTask}
                         onEditTask={onEditTask}
                         onDeleteTask={onDeleteTask}/>
            {currentTask && <ModalTaskEditor taskId={currentTask} onClose={onCloseTaskEditor} processId={process.Id}/>}
        </form>
}

const validate = (values) => {
    const errors = {}

    return errors
}

const mapState2Props = (state) => {
    return {
        process: processSelector(state),
        supervisors: supervisorsSelector(state),
        editors: editorsSelector(state),
        elements: elementsSelector(state),
        lessons: lessonsSelector(state),
        fetching: fetchingSelector(state),
        user: userSelector(state),
        isSupervisor: hasSupervisorRights(state),
        hasChanges: isDirty(EDITOR_NAME)(state),
        editorValues: getFormValues(EDITOR_NAME)(state),
        editorValid: isValid(EDITOR_NAME)(state)
    }
}

const mapDispatch2Props = (dispatch) => {
    return {
        actions: bindActionCreators({
            getProcess,
            saveProcess,
            hideSideBarMenu,
            showSideBarMenu,
            goBack,
            addElement,
            updateElement,
            deleteElement,
            deleteTask,
        }, dispatch)
    }
}

const enhance = compose(
    reduxForm({form: EDITOR_NAME, validate}),
    connect(mapState2Props, mapDispatch2Props)
)

export default enhance(ProcessEditor)
