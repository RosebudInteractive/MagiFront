import React, {useMemo,} from "react"
import {useLocation, useParams} from "react-router-dom"
import TaskEditor from "./task-editor";

export default function FullPageTaskEditor() {
    const location = useLocation(),
        params = useParams()

    const notificationUid = useMemo(() => {
        const _params = new URLSearchParams(location.search),
            _uid = _params.get('notification')

        return _uid ? _uid : null
    }, [location])

    return <TaskEditor taskId={params.taskId} notifUuid={notificationUid}/>
}
