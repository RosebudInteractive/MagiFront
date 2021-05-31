import {Route, Switch} from "react-router-dom";
import TestPage from "../frontend/containers/test-page";
import {TEST_PAGE_TYPE} from "../frontend/constants/common-consts";
import TestResultSharePage from "../frontend/components/test-result-share-page";
import React from "react";


type RouterProps = {}

export default function AppRouter(props: RouterProps) {
    return <Switch>
        <Route exact path={'/:testUrl'}
               render={(props) => (<TestPage {...props} type={TEST_PAGE_TYPE.TEST} isMobileApp={true}/>)}/>
        <Route path={'/test-instance/:testUrl'}
               render={(props) => (<TestPage {...props} type={TEST_PAGE_TYPE.INSTANCE}  isMobileApp={true}/>)}/>
        <Route path={'/result/:code'}
               render={(props) => (<TestResultSharePage {...props} type={TEST_PAGE_TYPE.RESULT}  isMobileApp={true}/>)}/>
    </Switch>
}