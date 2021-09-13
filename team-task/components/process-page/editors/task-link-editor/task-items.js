import React, {useEffect, useState} from "react"
import ArrowAdd from "tt-assets/svg/link-arrow-add.svg"
import ArrowDel from "tt-assets/svg/link-arrow-del.svg"

type TaskItemProps = {
    id: number,
    name: string,
    onClick: Function,
}

export function AvailableTask(props: TaskItemProps) {
    const {id, name, onClick} = props

    return <div className="link-editor__task available-task" onClick={() => onClick(id)}>
        <div className="task-title font-caption">{`${id}. ${name}`}</div>
        <div className="_button" onClick={onClick}>
            <ArrowAdd/>
        </div>
    </div>
}

export function DependingTask(props: TaskItemProps) {
    const {id, name, onClick} = props

    return <div className="link-editor__task depending-task" onClick={() => onClick(id)}>
        <div className="_button" onClick={onClick}>
            <ArrowDel/>
        </div>
        <div className="task-title font-caption">{`${id}. ${name}`}</div>
    </div>
}
