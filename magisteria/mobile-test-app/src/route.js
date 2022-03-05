import {Route, Switch} from "react-router-dom";
import TestPage from "containers/test-page";
import {TEST_PAGE_TYPE} from "#common/constants/common-consts";
import React from "react";


export default function AppRouter(props) {
    return <Switch>
        <Route exact path={'/:testUrl'}
               render={(props) => (<TestPage {...props} type={TEST_PAGE_TYPE.TEST} isMobileApp={true}/>)}/>
        <Route path={'/test-instance/:testUrl'}
               render={(props) => (<TestPage {...props} type={TEST_PAGE_TYPE.INSTANCE}  isMobileApp={true}/>)}/>
    </Switch>
}
