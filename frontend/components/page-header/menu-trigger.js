import React from 'react';
import './menu.css';
import {bindActionCreators} from "redux";
import * as pageHeaderActions from "../../actions/page-header-actions";
import {connect} from "react-redux";

class MenuTrigger extends React.Component{
    _onClick() {
        this.props.showMenu ? this.props.pageHeaderActions.hideMenu() : this.props.pageHeaderActions.showMenu();
    }

    render() {
        return (
            <button type="button" className="menu-trigger js-menu-trigger" onClick={::this._onClick}><span>Меню</span></button>
        )
    }
}

function mapStateToProps(state) {
    return {
        showMenu: state.pageHeader.showMenu,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        pageHeaderActions: bindActionCreators(pageHeaderActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(MenuTrigger);