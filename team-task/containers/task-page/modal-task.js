import React, {useEffect} from "react"
import TaskEditor from "./task-editor";
import $ from "jquery";

type Props = {
    taskId: number,
    editorVisible: boolean,
    onClose: Function,
    processId?: number,
    parentTaskId?: number,
}

export default function ModalTaskEditor(props: Props) {
    const {taskId, processId, parentTaskId, editorVisible, onClose, notifUuid, beforeCloseCallback} = props

    useEffect(() => {
        const _body = $("body")

        editorVisible ? _body.addClass("_no-vertical-scroll") : _body.removeClass("_no-vertical-scroll")
    }, [editorVisible]);

    function closeActions(){
        beforeCloseCallback();
        onClose();
    }

    return editorVisible ?
        <div className="modal-form tak-editor__modal-form">
            <div className="tak-editor__modal-wrapper">
                <TaskEditor taskId={taskId} processId={processId} parentTaskId={parentTaskId} notifUuid={notifUuid}/>
                <button type="button" className="modal-form__close-button"
                        onClick={closeActions}>Закрыть
                </button>
            </div>
        </div>
        :
        null
}
