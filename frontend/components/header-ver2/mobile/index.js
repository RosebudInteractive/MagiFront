import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './mobile-header.sass'
import Navigator from "../common/navigator";
import Menu from './menu'

export default class MobileHeader extends React.Component {

    static propTypes = {
        onClickMenuTrigger: PropTypes.func.isRequired,
        isPhoneViewPort: PropTypes.bool,
    };

    render() {
        const LOGO = '<use xlink:href="#logo-mob"/>'

        return (
            <div className="page-header__menu-mobile">
                <Link to={'/'} className="logo-mobile">
                    <svg width="70" height="38" dangerouslySetInnerHTML={{__html: LOGO}}/>
                </Link>
                <Navigator isPhoneViewPort={this.props.isPhoneViewPort}/>
                <div className="button-wrapper">
                    <button type="button" className="menu-trigger" onClick={this.props.onClickMenuTrigger}><span>Меню</span>
                    </button>
                </div>
                <Menu isPhoneViewPort={this.props.isPhoneViewPort}/>
            </div>
        )
    }
}