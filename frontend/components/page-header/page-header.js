import React from 'react';
import {connect} from 'react-redux';
import * as tools from '../../tools/size-tools';
import * as svg from '../../tools/svg-paths';
// import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import {DesktopLogo, DesktopNavigator, DesktopLanguages, DesktopSearch, DesktopUser} from './desktop-header';

class Header extends React.Component {
    constructor(props) {
        super(props);
        this._isMobile = tools.isMobile.bind(this);
    }

    render() {
        return (
            <header className={"page-header _fixed" + (!this.props.visible ? ' _animate' : '')}>
                {this._isMobile() ? <MobileHeaderRow/> : <DesktopHeaderRow />}
            </header>
        )
    }

}

class DesktopHeaderRow extends React.Component {
    render() {
        return (
            <div className="page-header__wrapper menu-mobile row">
                <DesktopLogo/>
                <DesktopNavigator/>
                <DesktopLanguages/>
                <DesktopSearch/>
                <DesktopUser/>
            </div>
        )
    }
}

class MobileHeaderRow extends React.Component {
    render() {
        return (
            <div className="page-header__menu-mobile">
                <button type="button" className="menu-trigger"><span>Меню</span></button>
                <a href="#" className="logo-mobile">
                    <svg width="70" height="38">
                        {svg.logoMob}
                    </svg>
                </a>
                <nav className="navigation navigation-mobile">
                    <ul>
                        <li className="current">
                            <a href="#">Курсы</a>
                        </li>
                        <li>
                            <a href="#">Календарь</a>
                        </li>
                    </ul>
                </nav>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        pageHeaderState: state.pageHeader,
        size: state.app.size,
    }
}

export default connect(mapStateToProps)(Header);