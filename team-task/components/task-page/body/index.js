import React, {useEffect, useRef, useMemo} from "react"
import TaskMainBlock from "./main-block";
import RightBlock from "./right-block";
import "./body.sass"


type TaskBodyProps = {
    task: any,
    elements: Array,
    currentElement: any,
    currentWriteFieldSet: ?string,
    users: Array,
    isSupervisor: boolean,
    onStartClick: Function,
}

export default function TaskBody(props: TaskBodyProps) {
    const {task, isSupervisor, currentElement,} = props

    return <div className="task-page__body">
        <TaskMainBlock
            isSupervisor={isSupervisor}
            elements={props.elements}
            currentElement={currentElement}
            currentWriteFieldSet={props.currentWriteFieldSet}
            taskState={task.State}
            onStartClick={props.onStartClick}/>
        <RightBlock task={task} users={props.users} isSupervisor={isSupervisor}/>
    </div>
}
