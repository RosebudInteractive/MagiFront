import React, {useEffect, useRef, useMemo} from "react"
import RightBlock from "./right-block";
import LeftBlock from "./left-block";
import "./body.sass"


type TaskBodyProps = {
    task: any,
    isSupervisor: boolean,
}

export default function TaskBody(props: TaskBodyProps) {
    const {task, isSupervisor} = props

    return <div className="task-page__body">
        <RightBlock hasChanged={false} task={task} isSupervisor={isSupervisor}/>
        <LeftBlock hasChanged={false} task={task}/>
    </div>
}
