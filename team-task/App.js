import React, {useEffect, useRef} from 'react'
import {connect} from 'react-redux'
import AppRouter from "./route"
import {bindActionCreators} from "redux"
import {useLocation} from "react-router-dom"
import {
    hasPmRights,
    hasSupervisorRights,
    initializedSelector,
    userAuthSelector,
    userRoleSelector,
    whoAmI
} from "tt-ducks/auth";
import './assets/styles/app.sass'
import './assets/styles/grid.sass'
import * as webix from 'webix/webix.js';
import SideBarMenu from "./containers/side-bar-menu";
import Breadcrumb from "./containers/header-pane";
import {fetchingSelector as taskFetching} from "tt-ducks/task";
import {fetchingSelector as tasksFetching} from "tt-ducks/tasks";
import {fetchingSelector as processFetching} from "tt-ducks/process";
import {fetchingSelector as processesFetching} from "tt-ducks/processes";
import {fetchingSelector as appFetching, getAppOptions} from "tt-ducks/app";
import {fetchingSelector as notificationsFetching, getNotifications, getOnlyUnread} from "tt-ducks/notifications";
import LoadingPage from "./components/loading-page";
import ReduxModalDialog from "./components/messages/modal-dialog/redux-modal-dialog";
import {dictionaryFetching, getAllDictionaryData} from "tt-ducks/dictionary";
import Auth from "./containers/auth";
import {Notification} from "rsuite";
import NotificationRefresher from "./components/notification-refresher";

window.webix = webix

function App(props) {
    const {fetching, actions, userInitialized, isUserAuthorized, hasPmRights, hasSupervisorRights, userRole} = props

    let location = useLocation();
    // const intervalId = useRef(null);

    // useEffect(() => {
    //     return function () {
    //         intervalId.current && clearInterval(intervalId.current);
    //     }
    // }, []);

    useEffect(() => {
        actions.getAppOptions();
    }, []);

    useEffect(() => {
        actions.whoAmI()

            // if(location.pathname.includes('notifications')){
            //    intervalId.current && clearInterval(intervalId.current);
            //    intervalId.current = setInterval(() => {
            //        actions.getNotifications();
            //    }, 120000)
            // } else {
            //     intervalId.current && clearInterval(intervalId.current);
            //     intervalId.current = setInterval(() => {
            //         actions.getOnlyUnreaded()
            //     }, 120000)
            // }


    }, [location]);

    useEffect(() => {
        isUserAuthorized && actions.getAllDictionaryData();
        isUserAuthorized && actions.getNotifications();
    }, [isUserAuthorized]);

    return isUserAuthorized && hasPmRights ?
        <React.Fragment>
            <div className="team-task tt-main-area">
                {fetching && <LoadingPage/>}
                <SideBarMenu/>
                <div className="tt-main-area__info-panel">
                    <Breadcrumb/>
                    <AppRouter hasSupervisorRights={hasSupervisorRights} userRole={userRole}/>
                </div>
            </div>
            <ReduxModalDialog/>
            <NotificationRefresher getList={actions.getNotifications} getUnreadCount={actions.getOnlyUnread}/>
        </React.Fragment>
        :
        <React.Fragment>
            {
                fetching ?
                    <LoadingPage/>
                    :
                    userInitialized && <Auth/>
            }
            <ReduxModalDialog/>
        </React.Fragment>
}

function mapStateToProps(state,) {
    return {
        isUserAuthorized: userAuthSelector(state),
        hasSupervisorRights: hasSupervisorRights(state),
        userInitialized: initializedSelector(state),
        hasPmRights: hasPmRights(state),
        userRole: userRoleSelector(state),
        fetching: tasksFetching(state)
            || processesFetching(state)
            || taskFetching(state)
            || processFetching(state)
            || dictionaryFetching(state)
            || appFetching(state)
            || notificationsFetching(state)
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            whoAmI,
            getAllDictionaryData,
            getAppOptions,
            getNotifications,
            getOnlyUnread
        }, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
