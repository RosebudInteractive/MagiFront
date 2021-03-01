import React from 'react'

import {Switch, Route,} from 'react-router-dom'
import Tasks from "./containers/tasks";
import Processes from "./containers/processes";

export default function AppRouter() {
    return <Switch>
        <Route exact path={'/tasks'} component={Tasks}/>
        <Route path={'/processes'} component={Processes}/>
    </Switch>
}
