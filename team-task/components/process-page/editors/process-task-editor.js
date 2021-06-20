import React from "react"
import {connect} from 'react-redux';
import {ModalTaskEditor} from "../../../containers/task-page";
import {
    closeTaskEditor,
    editorVisibleSelector,
    parentTaskIdSelector,
    processIdSelector,
    taskIdSelector
} from "tt-ducks/process-task";
import {bindActionCreators} from "redux";

function ProcessTaskEditor(props) {
    const {taskId, processId, actions, parentTaskId, editorVisible, notifUuid, beforeCloseCallback} = props

    return <ModalTaskEditor taskId={taskId} processId={processId}
                            onClose={actions.closeTaskEditor}
                            beforeCloseCallback={beforeCloseCallback}
                            editorVisible={editorVisible}
                            parentTaskId={parentTaskId}
                            notifUuid={notifUuid}/>
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




