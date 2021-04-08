import React from 'react'

import {Switch, Route,} from 'react-router-dom'
import Tasks from "./containers/tasks";
import Processes from "./containers/processes";
import {FullPageTaskEditor} from "./containers/task-page"
import ProcessEditor from "./containers/process-page";
import AccessDeniedPlaceholder from "./components/access-denied-placeholder";

type RouterProps = {
    hasSupervisorRights: boolean
}

export default function AppRouter(props: RouterProps) {
    return <Switch>
        <Route exact path={'/tasks'} component={Tasks}/>
        <Route path={'/task/:taskId'} component={FullPageTaskEditor}/>
        <Route path={'/processes'} render={() => {return props.hasSupervisorRights ? <Processes/> : <AccessDeniedPlaceholder/>}}/>
        <Route path={'/process/:processId'} render={() => {return props.hasSupervisorRights ? <ProcessEditor/> : <AccessDeniedPlaceholder/>}}/>
    </Switch>
}
