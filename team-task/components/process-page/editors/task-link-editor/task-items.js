import React, {useEffect, useState} from "react"
import ArrowAdd from "tt-assets/svg/link-arrow-add.svg"
import ArrowDel from "tt-assets/svg/link-arrow-del.svg"

type TaskItemProps = {
    id: number,
    name: string,
    onClick: Function,
}

export function AvailableTask(props: TaskItemProps) {
    return <div className="link-editor__task available-task" onClick={() => props.onClick(props.id)}>
        <div className="task-title font-caption">{props.name}</div>
        <div className="_button">
            <ArrowAdd/>
        </div>
    </div>
}

export function DependingTask(props: TaskItemProps) {
    return <div className="link-editor__task depending-task" onClick={() => props.onClick(props.id)}>
        <div className="_button" onClick={props.onClick}>
            <ArrowDel/>
        </div>
        <div className="task-title font-caption">{props.name}</div>
    </div>
}
