import React, {useState, useEffect} from "react"
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import "./header-pane.sass"
import {userSelector} from "tt-ducks/auth";
import Breadcrumb from "../../components/breadcrumb";

function HeaderPane(props) {
    const {user} = props

    return <nav className="header-pane">
        <Breadcrumb/>
        <div className="user-block">
            <div className="user-block__name">{user.DisplayName}</div>
            <button className="grey-button logout-button">Выйти</button>
        </div>
    </nav>
}

const mapState2Props = (state) => {
    return {
        user: userSelector(state)
    }
}

const mapDispatch2Props = (dispatch) => {
    return {
        actions: bindActionCreators({}, dispatch)
    }
}

export default connect(mapState2Props, mapDispatch2Props)(HeaderPane)

