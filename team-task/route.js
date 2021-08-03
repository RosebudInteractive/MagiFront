import React from 'react'

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

type RouterProps = {
    hasSupervisorRights: boolean,
    userRole: string,
    hasAdminRights: boolean
}

export default function AppRouter(props: RouterProps) {

    const { userRole } = props

    const _hasAdminRights = (userRole === USER_ROLE.PMA) || (userRole === USER_ROLE.ADMIN)

    return <Switch>
        <Route exact path={'/tasks'} component={Tasks}/>
        <Route path={'/tasks/:taskId'} component={FullPageTaskEditor}/>
        <Route path={'/processes'} render={() => {return props.hasSupervisorRights ? <Processes/> : <AccessDeniedPlaceholder/>}}/>
        <Route exact path={'/notifications'}  render={() => (<Notifications showModal={false}/>)}/>
        <Route exact path={'/timelines'}
               render={() => {return (props.hasSupervisorRights || props.hasAdminRights) ? <Timelines/> : <AccessDeniedPlaceholder/>}}/>
        <Route exact path={'/timelines/:timelineId'}
               render={() => {return (props.hasSupervisorRights || props.hasAdminRights) ? <TimelineEditorContainer/> : <AccessDeniedPlaceholder/>}}/>
        <Route exact path={'/timelines/new'}  render={() => (<TimelineEditorContainer/>)}/>
        <Route exact path={'/notifications/task/:taskId'} render={() => (<Notifications showModal={true}/>)}/>
        <Route path={'/process/:processId'} render={() => {return props.hasSupervisorRights ? <ProcessEditor/> : <AccessDeniedPlaceholder/>}}/>
        <Route path={'/dictionaries/:dictionaryName'} render={({match}) => {
            if (_hasAdminRights) {
                switch (match.params.dictionaryName) {
                    case 'users':
                        return <DictionaryUsers/>;
                    case 'components':
                        return <DictionaryComponents/>;
                    default:
                        return;
                }
            } else {
                return <AccessDeniedPlaceholder/>
            }

        }}/>
    </Switch>
}
