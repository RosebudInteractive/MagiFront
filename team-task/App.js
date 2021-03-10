import React, {useEffect} from 'react'
import {connect} from 'react-redux'
import AppRouter from "./route"
import {bindActionCreators} from "redux"
import {useLocation} from "react-router-dom"

// import SignInForm from './sign-in-form';

import {userAuthSelector, whoAmI} from "tt-ducks/auth";
// import {getAppOptions,} from "../ducks/app";

// import Toolbar from "../components/app/toolbar";
// import * as appActions from '../actions/app-actions'
import './assets/styles/app.sass'
import './assets/styles/grid.sass'
// import './assets/styles/colors.sass'
// import ReviewsPage from "./lists/reviews";
import * as webix from 'webix/webix.js';
// import TranscriptEditor from "./editors/transcript-editor";
// import "../tools/player-notifier"
import SideBarMenu from "./containers/side-bar-menu";
import Breadcrumb from "./containers/header-pane";
import {fetchingSelector as taskFetching} from "tt-ducks/task";
import {fetchingSelector as tasksFetching} from "tt-ducks/tasks";
import {fetchingSelector as processesFetching} from "tt-ducks/processes";
import LoadingPage from "./components/loading-page";

window.webix = webix

function App(props) {
    const {fetching, actions, isUserAuthorized} = props

    let location = useLocation();

    useEffect(() => {
        actions.whoAmI()
    },[location])

    return isUserAuthorized ?
        <div className="team-task tt-main-area">
            { fetching && <LoadingPage/> }
            <SideBarMenu/>
            <div className="tt-main-area__info-panel">
                <Breadcrumb/>
                <AppRouter/>
            </div>
        </div>
        :
        null
}

function mapStateToProps(state,) {
    return {
        isUserAuthorized: userAuthSelector(state),
        fetching: tasksFetching(state) || processesFetching(state) || taskFetching(state)
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({whoAmI,}, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
