import React from "react"
import {connect} from 'react-redux';
import TaskEditor from "./task-editor";
import {editorVisibleSelector, taskIdSelector, processIdSelector, closeTaskEditor} from "tt-ducks/process-task";
import {bindActionCreators} from "redux";

function ModalTaskEditor(props) {
    const {taskId, processId, actions} = props

    return props.editorVisible ?
        <div className="modal-form tak-editor__modal-form">
            <div className="tak-editor__modal-wrapper">
                <TaskEditor taskId={taskId} processId={processId}/>
                <button type="button" className="modal-form__close-button"
                        onClick={actions.closeTaskEditor}>Закрыть
                </button>
            </div>
        </div>
        :
        null
}

const mapState2Props = (state) => {
    return {
        taskId: taskIdSelector(state),
        processId: processIdSelector(state),
        editorVisible: editorVisibleSelector(state)
    }
}

const mapDispatch2Props = (dispatch) => {
    return {
        actions: bindActionCreators({closeTaskEditor}, dispatch)
    }
}

export default connect(mapState2Props, mapDispatch2Props)(ModalTaskEditor)




