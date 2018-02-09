import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from "redux";

import DesktopHeaderRow from './desktop-header';
import FilterRow from './desktop-filters';
import MenuMobile from './menu-mobile';

import * as tools from '../../tools/size-tools';
import * as svg from '../../tools/svg-paths';

import * as pageHeaderActions from "../../actions/page-header-actions";

class Header extends React.Component {
    constructor(props) {
        super(props);
        this._isMobile = tools.isMobile.bind(this);
    }

    _onClickMenuTrigger() {
        this.props.pageHeaderState.showMenu ? this.props.pageHeaderActions.hideMenu() : this.props.pageHeaderActions.showMenu();
    }

    render() {
        let _menuOpened = this.props.pageHeaderState.showMenu;
        let _headerClass = 'page-header' + (_menuOpened ? ' opened' : ' _fixed' + (!this.props.visible ? ' _animate' : ''));

        return (

            <header className={_headerClass}>
                {this._isMobile() ?
                    <div>
                        <MobileHeaderRow onClickMenuTrigger={::this._onClickMenuTrigger}/>
                        <MenuMobile/>
                    </div>
                    :
                    <div>
                        <DesktopHeaderRow/>
                        <FilterRow/>
                    </div>
                }
            </header>
        )
    }

}

class MobileHeaderRow extends React.Component {
    render() {
        return (
            <div className="page-header__menu-mobile">
                <button type="button" className="menu-trigger" onClick={this.props.onClickMenuTrigger}><span>Меню</span></button>
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

function mapDispatchToProps(dispatch) {
    return {
        pageHeaderActions: bindActionCreators(pageHeaderActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Header);