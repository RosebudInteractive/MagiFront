import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from "redux";

import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './mobile-header.sass'
import Navigator from "../common/navigator";
import Menu from './menu'
import {OverflowHandler} from "tools/page-tools";

import {showMenu, hideMenu} from "actions/page-header-actions";
import {setInitialState} from "ducks/filters";

class MobileHeader extends React.Component {

    static propTypes = {
        onClickMenuTrigger: PropTypes.func.isRequired,
        isPhoneViewPort: PropTypes.bool,
    };

    componentWillUnmount() {
        this._hideUserMenu()
    }

    render() {
        const LOGO = '<use xlink:href="#logo-mob"/>'

        return (
            <div className="page-header__menu-mobile">
                <Link to={'/'} className="logo-mobile" onClick={::this.props.setInitialState}>
                    <svg width="70" height="38" dangerouslySetInnerHTML={{__html: LOGO}}/>
                </Link>
                <Navigator isPhoneViewPort={this.props.isPhoneViewPort}/>
                <div className="button-wrapper">
                    <button type="button" className="menu-trigger" onClick={::this._onClickMenuTrigger}>
                        <span>Меню</span>
                    </button>
                </div>
                <Menu isPhoneViewPort={this.props.isPhoneViewPort}/>
            </div>
        )
    }

    _onClickMenuTrigger() {
        if (this.props.isMenuVisible) {
            this._hideUserMenu()
        } else {
            this._showUserMenu()
        }
    }

    _showUserMenu() {
        this.props.showMenu()
        OverflowHandler.rememberScrollPos();
        OverflowHandler.turnOn();
    }

    _hideUserMenu() {
        this.props.hideMenu()
        if (!this.props.isSignInFormVisible) {
            OverflowHandler.turnOff();
        }
    }
}

const mapStateToProps = (state) => {
    return {
        isMenuVisible: state.pageHeader.showMenu,
        isSignInFormVisible: state.app.showSignInForm,
    }
}

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({showMenu, hideMenu, setInitialState}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(MobileHeader)