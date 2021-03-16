import React from 'react'

import {Switch, Route,} from 'react-router-dom'
import Tasks from "./containers/tasks";
import Processes from "./containers/processes";
import TaskEditor from "./containers/task-page"
import ProcessEditor from "./containers/process-page";

export default function AppRouter() {
    return <Switch>
        <Route exact path={'/tasks'} component={Tasks}/>
        <Route path={'/processes'} component={Processes}/>
        <Route path={'/task/:taskId'} component={TaskEditor}/>
        <Route path={'/processes/:processId'} component={ProcessEditor}/>
    </Switch>
}
