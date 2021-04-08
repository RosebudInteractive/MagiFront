import React from "react"
import {useParams} from "react-router-dom"
import TaskEditor from "./task-editor";

export default function FullPageTaskEditor() {
    const params = useParams()

    return <TaskEditor taskId={params.taskId}/>
}
