import React, {useMemo} from 'react'

import {Route, Switch,} from 'react-router-dom'
import Tasks from "./containers/tasks";
import Processes from "./containers/processes";
import {FullPageTaskEditor} from "./containers/task-page"
import ProcessEditor from "./containers/process-page";
import AccessDeniedPlaceholder from "./components/access-denied-placeholder";
import DictionaryUsers from "./components/dictionaries/users/users";
import DictionaryComponents from "./components/dictionaries/components/components"
import Notifications from "./containers/notifications"
import {USER_ROLE} from "./constants/common";
import Timelines from "./containers/timelines/list";
import TimelineEditorContainer from "./containers/timelines/editor"
import DashboardRecords from "./containers/dashboard-records"
import AccessRights from "./components/dictionaries/roles";
import TaskTypes from "./components/dictionaries/task-types";
import Images from "#src/containers/images";

type RouterProps = {
    hasSupervisorRights: boolean,
    userRole: string,
    hasAdminRights: boolean,
    permissions: Object,
}

export default function AppRouter(props: RouterProps) {

    const { userRole, permissions, hasAdminRights, hasSupervisorRights } = props

    const _hasAdminRights = (userRole === USER_ROLE.PMA) || (userRole === USER_ROLE.ADMIN)

    const isAdmin = (userRole === USER_ROLE.ADMIN);

    const hasDashboardAccess = useMemo(() => permissions.dsb && permissions.dsb.al, [permissions])

    return <Switch>
        <Route exact path={'/tasks'} component={Tasks}/>
        <Route path={'/tasks/:taskId'} component={FullPageTaskEditor}/>
        <Route path={'/dashboard-records'} render={() => {return  hasDashboardAccess ? <DashboardRecords/> : <AccessDeniedPlaceholder/>}}/>
        <Route path={'/processes'} render={() => {return hasSupervisorRights ? <Processes/> : <AccessDeniedPlaceholder/>}}/>
        <Route exact path={'/notifications'}  render={() => (<Notifications showModal={false}/>)}/>
        <Route exact path={'/timelines'}
               render={() => {
                   return (hasSupervisorRights || hasAdminRights) ? <Timelines/> : <AccessDeniedPlaceholder/>
               }}/>
        <Route exact path={'/timelines/:timelineId'}
               render={() => {return (hasSupervisorRights || hasAdminRights) ? <TimelineEditorContainer/> : <AccessDeniedPlaceholder/>}}/>
        <Route exact path={'/timelines/new'}  render={() => (<TimelineEditorContainer/>)}/>
        <Route exact path={'/notifications/task/:taskId'} render={() => (<Notifications showModal={true}/>)}/>
        <Route path={'/process/:processId'} render={() => {return hasSupervisorRights ? <ProcessEditor/> : <AccessDeniedPlaceholder/>}}/>
        <Route path={'/dictionaries/:dictionaryName'} render={({match}) => {
            if (_hasAdminRights) {
                switch (match.params.dictionaryName) {
                    case 'users':
                        return <DictionaryUsers/>;
                    case 'components':
                        return <DictionaryComponents/>;
                    case 'rights':
                        return  isAdmin ? <AccessRights/> : <AccessDeniedPlaceholder/>;
                    case 'task-types':
                        return <TaskTypes/>;
                    default:
                        return;
                }
            } else {
                return <AccessDeniedPlaceholder/>
            }

        }}/>
        <Route path={'/images'} component={Images}/>
    </Switch>
}
