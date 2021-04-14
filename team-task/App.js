import React, {useEffect} from 'react'
import {connect} from 'react-redux'
import AppRouter from "./route"
import {bindActionCreators} from "redux"
import {useLocation} from "react-router-dom"
import {hasSupervisorRights, userAuthSelector, userSelector, whoAmI} from "tt-ducks/auth";
import './assets/styles/app.sass'
import './assets/styles/grid.sass'
import * as webix from 'webix/webix.js';
import SideBarMenu from "./containers/side-bar-menu";
import Breadcrumb from "./containers/header-pane";
import {fetchingSelector as taskFetching} from "tt-ducks/task";
import {fetchingSelector as tasksFetching} from "tt-ducks/tasks";
import {fetchingSelector as processFetching} from "tt-ducks/process";
import {fetchingSelector as processesFetching} from "tt-ducks/processes";
import LoadingPage from "./components/loading-page";
import ReduxModalDialog from "./components/messages/modal-dialog/redux-modal-dialog";

window.webix = webix

function App(props) {
    const {fetching, actions, isUserAuthorized, hasSupervisorRights, user} = props

    let location = useLocation();

    useEffect(() => {
        actions.whoAmI()
    },[location])

    useEffect(() => {
        console.log(isUserAuthorized)
    }, [user])

    return isUserAuthorized ?
        <React.Fragment>
            <div className="team-task tt-main-area">
                { fetching && <LoadingPage/> }
                <SideBarMenu/>
                <div className="tt-main-area__info-panel">
                    <Breadcrumb/>
                    <AppRouter hasSupervisorRights={hasSupervisorRights}/>
                </div>
            </div>

            <ReduxModalDialog/>
        </React.Fragment> :
        null;
}

function mapStateToProps(state,) {
    return {
        isUserAuthorized: userAuthSelector(state),
        user: userSelector(state),
        hasSupervisorRights: hasSupervisorRights(state),
        fetching: tasksFetching(state) || processesFetching(state) || taskFetching(state) || processFetching(state)
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({whoAmI,}, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
