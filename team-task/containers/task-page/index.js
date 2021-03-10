import React, {useEffect, useRef, useMemo, useState} from "react"
import {compose} from "redux"
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {useLocation, useParams} from "react-router-dom"
import {getTask, taskSelector, fetchingSelector} from "tt-ducks/task";
import TaskHeader from "../../components/task-page/header";
import {reduxForm,} from "redux-form";
import TaskBody from "../../components/task-page/body";
import {hasSupervisorRights} from "tt-ducks/auth";
import "./task-page.sass"

function TaskEditor(props) {
    const {actions, task, fetching, isSupervisor} = props

    const [update, setUpdate] = useState(false)

    const location = useLocation(),
        params = useParams()

    useEffect(() => {
        actions.getTask(params.taskId)
    }, [])

    useEffect(() => {
        if (task) {
            const _object = {
                Name: task.Name,
                Description: task.Description,
                State: task.State,
                IsElemReady: task.IsElemReady,
                WriteFieldSet: task.WriteFieldSet,
                ElementId: task.Element.Id,
            }

            task.Fields.forEach((field) => {
                _object[field.name] = field.value
            })

            props.initialize(_object)

            setUpdate(!update)
        }
    }, [task])


    return !fetching && task &&
        <form className="task-editor-page form" action={"javascript:void(0)"}>
            <TaskHeader hasChanged={false} taskId={task.Id} processName={"Process1"}/>
            <TaskBody task={task} isSupervisor={isSupervisor}/>
        </form>
}

const validate = (values) => {
    const errors = {}

    return errors
}

const mapState2Props = (state) => {
    return {
        task: taskSelector(state),
        fetching: fetchingSelector(state),
        isSupervisor: hasSupervisorRights(state),
    }
}

const mapDispatch2Props = (dispatch) => {
    return {
        actions: bindActionCreators({getTask}, dispatch)
    }
}



const enhance = compose(
    reduxForm({form: "TASK_EDITOR", validate}),
    connect(mapState2Props, mapDispatch2Props)
)

export default enhance(TaskEditor)
