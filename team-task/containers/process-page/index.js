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
import ProcessHeader from "../../components/process-page/header";
import ProcessBody from "../../components/process-page/body";
import {UpdatingProcess} from "../../types/process"

const EDITOR_NAME = "PROCESS_EDITOR"

function ProcessEditor(props) {
    const {actions, process, fetching, hasChanges, editorValues,} = props

    const params = useParams()

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

    return !fetching && process &&
        <form className="process-editor-page form" onSubmit={e => e.preventDefault()}>
            <ProcessHeader hasChanges={hasChanges} state={process.State} onSave={_save} onBack={_back}/>
            <ProcessBody process={process}
                         supervisors={props.supervisors}
                         editors={props.editors}
                         elements={props.elements}
                         lessons={props.lessons}
                         hasChanges={hasChanges}
                         onAddElement={actions.addElement}
                         onUpdateElement={actions.updateElement}
                         onDeleteElement={actions.deleteElement}/>
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
        }, dispatch)
    }
}

const enhance = compose(
    reduxForm({form: EDITOR_NAME, validate}),
    connect(mapState2Props, mapDispatch2Props)
)

export default enhance(ProcessEditor)
