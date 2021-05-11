import {Route, Switch} from "react-router-dom";
import TestPage from "../frontend/containers/test-page";
import {TEST_PAGE_TYPE} from "../frontend/constants/common-consts";
import TestResultSharePage from "../frontend/components/test-result-share-page";
import TestResultPreview from "../frontend/containers/test-result-preview";
import React from "react";


type RouterProps = {}

export default function AppRouter(props: RouterProps) {
    return <Switch>
        <Route exact path={'/:testUrl'}
               render={(props) => (<TestPage {...props} type={TEST_PAGE_TYPE.TEST}/>)}/>
        <Route path={'/instance/:testUrl'}
               render={(props) => (<TestPage {...props} type={TEST_PAGE_TYPE.INSTANCE}/>)}/>
        <Route path={'/result/:code'}
               render={(props) => (<TestResultSharePage {...props} type={TEST_PAGE_TYPE.RESULT}/>)}/>
        <Route path={'/result-preview/:instanceId'} component={TestResultPreview}/>
    </Switch>
}
