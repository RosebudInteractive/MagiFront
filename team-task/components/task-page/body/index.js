import React from "react"
import TaskMainBlock from "./main-block";
import RightBlock from "./right-block";
import "./body.sass"

type TaskBodyProps = {
    task: any,
    elements: Array,
    currentElement: any,
    currentWriteFieldSet: ?string,
    users: Array,
    onStartClick: Function,
    onSaveComment: Function,
}

export default function TaskBody(props: TaskBodyProps) {
    const {task, currentElement, onSaveComment} = props

    return <div className="task-page__body">
        <TaskMainBlock elements={props.elements}
                       currentElement={currentElement}
                       currentWriteFieldSet={props.currentWriteFieldSet}
                       taskState={task.State}
                       onStartClick={props.onStartClick}/>
        <RightBlock task={task} users={props.users} onSaveComment={onSaveComment}/>
    </div>
}
