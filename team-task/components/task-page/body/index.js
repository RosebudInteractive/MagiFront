import React from "react"
import TaskMainBlock from "./main-block";
import RightBlock from "./right-block";
import "./body.sass"
import {USER_ROLE} from "../../../constants/common";
import {TASK_STATE} from "../../../constants/states";


type TaskBodyProps = {
    task: any,
    elements: Array,
    currentElement: any,
    currentWriteFieldSet: ?string,
    users: Array,
    userRole: string,
    isSupervisor: boolean,
    onStartClick: Function,
}

export default function TaskBody(props: TaskBodyProps) {
    const {task, isSupervisor, currentElement, userRole} = props

    const _isReadOnly = (userRole === USER_ROLE.PMU) && ((task.State === TASK_STATE.WAITING.value) || (task.State === TASK_STATE.DONE.value))

    return <div className="task-page__body">
        <TaskMainBlock
            isReadOnly={_isReadOnly}
            isSupervisor={isSupervisor}
            elements={props.elements}
            currentElement={currentElement}
            currentWriteFieldSet={props.currentWriteFieldSet}
            taskState={task.State}
            userRole={userRole}
            onStartClick={props.onStartClick}/>
        <RightBlock task={task} users={props.users} isSupervisor={isSupervisor} userRole={userRole} isReadOnly={_isReadOnly}/>
    </div>
}
