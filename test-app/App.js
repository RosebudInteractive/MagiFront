import React, {useEffect,} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from "redux";
import AppRouter from "./route";
import {fetchingSelector, tokenGuardEnable, getAppOptions} from "ducks/app";
import {whoAmI} from "actions/user-actions";
import {useLocation, useHistory} from "react-router-dom";
import "./app.sass"
import {sendMessage} from "../scripts/native-app-player/message-handler";

function App(props) {

    const {actions, fetching, tokenGuardEnable, userAuthorized} = props

    let location = useLocation();
    let history = useHistory();

    useEffect(() => {
        const _params = new URLSearchParams(location.search),
            _token = _params.get('token')

        if (_token) {
            _params.delete('token')
            history.replace({
                search: _params.toString(),
            })
        }

        actions.getAppOptions(_token)
    }, [])

    useEffect(() => {
        if (!tokenGuardEnable) {
            actions.whoAmI()
        }
    }, [tokenGuardEnable])

    useEffect(() => {
        if (userAuthorized) {
            sendMessage({ isLoaded: true })
        }
    }, [userAuthorized])


    return !fetching && userAuthorized ?
        <div>
            <AppRouter/>
        </div>
        :
        null
}

const mapStateToProps = (state) => {
    return {
        fetching: fetchingSelector(state),
        tokenGuardEnable: tokenGuardEnable(state),
        userAuthorized: !!state.user.user
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        actions: bindActionCreators({getAppOptions, whoAmI}, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
