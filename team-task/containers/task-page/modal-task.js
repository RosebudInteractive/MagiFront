import React from "react"
import TaskEditor from "./task-editor";

type EditorProps = {
    taskId: number,
    processId: number,
    onClose: Function,
}

export default function ModalTaskEditor(props: EditorProps) {
    return <div className="modal-form tak-editor__modal-form">
        <div className="tak-editor__modal-wrapper">
            <TaskEditor taskId={props.taskId} processId={props.processId}/>
            <button type="button" className="modal-form__close-button" onClick={props.onClose}>Закрыть</button>
        </div>
    </div>
}

const mapState2Props = (state) => {
    return {
        editorVisible: editorVisibleSelector(state)
    }
}




