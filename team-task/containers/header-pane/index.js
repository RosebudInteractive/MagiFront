import React, {useState, useEffect} from "react"
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import "./header-pane.sass"
import {userSelector} from "tt-ducks/auth";
import Breadcrumb from "../../components/breadcrumb";
import {sideBarMenuVisible} from "tt-ducks/app";
import {logout} from "tt-ducks/auth";

function HeaderPane(props) {
    const {user, sideBarMenuVisible, actions} = props

    return <nav className={"header-pane" + (sideBarMenuVisible ? "" : " _full-width")}>
        <Breadcrumb/>
        <div className="user-block">
            <div className="user-block__name">{user.DisplayName}</div>
            <button className="grey-button logout-button" onClick={actions.logout}>Выйти</button>
        </div>
    </nav>
}

const mapState2Props = (state) => {
    return {
        user: userSelector(state),
        sideBarMenuVisible: sideBarMenuVisible(state),
    }
}

const mapDispatch2Props = (dispatch) => {
    return {
        actions: bindActionCreators({logout}, dispatch)
    }
}

export default connect(mapState2Props, mapDispatch2Props)(HeaderPane)

