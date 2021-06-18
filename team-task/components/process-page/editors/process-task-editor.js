import React from "react"
import {connect} from 'react-redux';
import {ModalTaskEditor} from "../../../containers/task-page";
import {
    editorVisibleSelector,
    taskIdSelector,
    parentTaskIdSelector,
    processIdSelector,
    closeTaskEditor
} from "tt-ducks/process-task";
import {bindActionCreators} from "redux";

function ProcessTaskEditor(props) {
    const {taskId, processId, actions, parentTaskId, editorVisible} = props

    return <ModalTaskEditor taskId={taskId} processId={processId} onClose={actions.closeTaskEditor}
                            editorVisible={editorVisible} parentTaskId={parentTaskId}/>
}

const mapState2Props = (state) => {
    return {
        taskId: taskIdSelector(state),
        parentTaskId: parentTaskIdSelector(state),
        processId: processIdSelector(state),
        editorVisible: editorVisibleSelector(state)
    }
}

const mapDispatch2Props = (dispatch) => {
    return {
        actions: bindActionCreators({closeTaskEditor}, dispatch)
    }
}

export default connect(mapState2Props, mapDispatch2Props)(ProcessTaskEditor)




