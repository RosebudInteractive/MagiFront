import React, {useCallback, useEffect, useRef,} from "react"
import {compose} from "redux"
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {Prompt, useLocation, useParams} from "react-router-dom"
import {
    getProcess,
    saveProcess,
    goBack,
    addElement,
    updateElement,
    deleteElement,
    clear,
    updateProcessTask,
    updateDependence,
    deleteDependence,
    processSelector,
    supervisorsSelector,
    editorsSelector,
    elementsSelector,
    lessonsSelector,
    fetchingSelector,
} from "tt-ducks/process";
import {getFormValues, isDirty, isValid, reduxForm,} from "redux-form";
import {hasAdminRights, userSelector,} from "tt-ducks/auth";
import {hideSideBarMenu, horizontalProcess, showSideBarMenu, changeProcessRotation} from "tt-ducks/app";
import {activeTaskIdSelector, setActiveTaskId, setInitState} from "tt-ducks/route";
import {deleteTask} from "tt-ducks/task";
import {showTaskEditor, showTaskLinkEditor,} from "tt-ducks/process-task";
import ProcessHeader from "../../components/process-page/header";
import ProcessBody from "../../components/process-page/body";
import {UpdatingProcess} from "../../types/process"
import {buildTree, parseParams, _scrollHandler} from "./functions";
import ProcessTaskEditor from "../../components/process-page/editors/process-task-editor";
import type {ProcessTask} from "../../types/task";
import TaskLinksEditor from "../../components/process-page/editors/task-link-editor";
import $ from "jquery";

const EDITOR_NAME = "PROCESS_EDITOR"

function ProcessEditor(props) {
    const {actions, process, fetching, hasChanges, editorValues, isAdmin} = props

    const params = useParams()
    const location = useLocation()

    const tree = useRef()

    useEffect(() => {
        actions.hideSideBarMenu()
        actions.getProcess(params.processId)
        $("body").addClass("_no-horizontal-scroll")

        $(window).bind('resize scroll toggle-elements-visible', _scrollHandler)

        return () => {
            actions.clear()
            actions.showSideBarMenu()

            $(window).unbind('resize scroll toggle-elements-visible', _scrollHandler)
            $("body").removeClass("_no-horizontal-scroll")
        }
    }, [])

    useEffect(() => {
        const initState = parseParams()
        initState.pathname = location.pathname
        actions.setInitState(initState)
    }, [location])

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

    const onEditTaskLinks = (taskId) => {
        actions.showTaskLinkEditor({processId: process.Id, taskId})
    }

    const onEditTask = (taskId) => {
        actions.showTaskEditor({processId: process.Id, taskId})
    }

    const onAddTask = () => {
        actions.showTaskEditor({processId: process.Id, taskId: -1})
    }

    const onAddTaskWithLink = (parentTaskId) => {
        actions.showTaskEditor({processId: process.Id, taskId: -1, parentTaskId})
    }

    const onDeleteTask = (taskId) => {
        const data: ProcessTask = {taskId: taskId, processId: process.Id}
        actions.deleteTask(data)
        if (props.activeTaskId === taskId) {
            actions.setActiveTaskId(null)
        }
    }

    const onSetActiveTask = (taskId) => {
        actions.setActiveTaskId(taskId)
    }

    const deleteDependence = useCallback((dependence) => {
        actions.deleteDependence(dependence.from, dependence.to)
    }, [])

    const updateDependence = useCallback((dependence) => {
        actions.updateDependence(dependence)
    }, [])

    return !fetching && process &&
        <React.Fragment>
            <Prompt when={hasChanges} message={'Есть несохраненные данные.\n Перейти без сохранения?'}/>
            <form className="process-editor-page form" onSubmit={e => e.preventDefault()}>
                <ProcessHeader hasChanges={hasChanges} state={process.State} onSave={_save} onBack={_back}/>
                <ProcessBody process={process}
                             isAdmin={isAdmin}
                             horizontalProcess={props.horizontalProcess}
                             tree={tree.current}
                             supervisors={props.supervisors}
                             editors={props.editors}
                             elements={props.elements}
                             lessons={props.lessons}
                             hasChanges={hasChanges}
                             activeTaskId={props.activeTaskId}
                             onSetActiveTaskId={onSetActiveTask}
                             onAddElement={actions.addElement}
                             onUpdateElement={actions.updateElement}
                             onDeleteElement={actions.deleteElement}
                             onUpdateProcessTask={actions.updateProcessTask}
                             onAddTask={onAddTask}
                             onAddTaskWithLink={onAddTaskWithLink}
                             onEditTaskLinks={onEditTaskLinks}
                             onEditTask={onEditTask}
                             onDeleteTask={onDeleteTask}
                             onDeleteDependence={deleteDependence}
                             onUpdateDependence={updateDependence}
                             onChangeRotation={actions.changeProcessRotation}/>
                <ProcessTaskEditor/>
                <TaskLinksEditor/>
            </form>
        </React.Fragment>
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
        isAdmin: hasAdminRights(state),
        activeTaskId: activeTaskIdSelector(state),
        hasChanges: isDirty(EDITOR_NAME)(state),
        editorValues: getFormValues(EDITOR_NAME)(state),
        editorValid: isValid(EDITOR_NAME)(state),
        horizontalProcess: horizontalProcess(state)
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
            showTaskEditor,
            showTaskLinkEditor,
            clear,
            setActiveTaskId,
            setInitState,
            changeProcessRotation,
            updateProcessTask,
            updateDependence,
            deleteDependence,
        }, dispatch)
    }
}

const enhance = compose(
    reduxForm({form: EDITOR_NAME, validate}),
    connect(mapState2Props, mapDispatch2Props)
)

export default enhance(ProcessEditor)
