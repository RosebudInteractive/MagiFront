import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from "redux";

import DesktopHeader from './desktop';
import MobileHeaderRow from '../page-header/mobile-header';
import MobileFilter from '../page-header/desktop-filters';

import * as pageHeaderActions from "../../actions/page-header-actions";
import * as appActions from "../../actions/app-actions";
import {isMobile, OverflowHandler, pages, widthLessThan900} from "../../tools/page-tools";
import $ from "jquery";

class Header extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isMobile: isMobile()
        }

        this._width = window.innerWidth;

        this._handleResize = function() {
            if (this.state.isMobile !== isMobile()) {
                this.setState({isMobile: isMobile()})
            }
        }.bind(this)

        this._addEventListeners();
    }

    componentDidMount() {
        this._handleResize();
    }

    componentWillUnmount() {
        this._removeEventListeners();
    }

    componentDidUpdate() {
        let _isCoursesPage = this.props.pageHeaderState.currentPage.name === pages.courses.name;
        if (!_isCoursesPage && this.props.pageHeaderState.showFiltersForm) {
            this.props.pageHeaderActions.hideFiltersForm()
        }

        if (widthLessThan900() && !this.props.showUserBlock) {
            this.props.appActions.showUserBlock()
        }

        if ((this._width < 900) && !widthLessThan900()) {
            this.props.appActions.hideUserBlock()
            this._hideUserMenu()
        }

        this._width = window.innerWidth;
    }

    _onClickMenuTrigger() {
        if (this.props.pageHeaderState.showMenu) {
            this._hideUserMenu()
        } else {
            this._showUserMenu()
        }
    }

    _showUserMenu() {
        this.props.pageHeaderActions.showMenu()
        OverflowHandler.rememberScrollPos();
        OverflowHandler.turnOn();
    }

    _hideUserMenu() {
        this.props.pageHeaderActions.hideMenu()
        if (!this.props.showSignInForm) {
            OverflowHandler.turnOff();
        }
    }

    render() {
        let {authorized, pageHeaderState, visible} = this.props,
            _menuOpened = pageHeaderState.showMenu,
            _headerClass = 'header-ver2 page-header' + (_menuOpened ? ' opened' : ' _fixed' + (!visible ? ' _animate' : ''))

        return (
            this.props.pageHeaderState.visibility ?
                <header className={_headerClass}>
                    <div className='page-header__row'>
                        {
                            this.state.isMobile ?
                                <MobileHeaderRow onClickMenuTrigger={::this._onClickMenuTrigger}
                                                 currentPage={pageHeaderState.currentPage}/>
                                :
                                <DesktopHeader/>
                        }
                    </div>
                    {/*<MobileFilter/>*/}
                </header>
                : null
        )
    }

    _addEventListeners() {
        $(window).bind('resize', this._handleResize)
    }

    _removeEventListeners() {
        $(window).unbind('resize', this._handleResize)
    }

}

function mapStateToProps(state, ownProps) {
    return {
        pageHeaderState: state.pageHeader,
        authorized: !!state.user.user,
        showUserBlock: state.app.showUserBlock,
        showSignInForm: state.app.showSignInForm,
        ownProps,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        pageHeaderActions: bindActionCreators(pageHeaderActions, dispatch),
        appActions: bindActionCreators(appActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Header);