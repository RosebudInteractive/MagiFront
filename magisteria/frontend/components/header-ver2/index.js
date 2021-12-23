import React from 'react';
import {connect} from 'react-redux';

import DesktopHeader from './desktop';
import MobileHeader from './mobile';

import {isMobile, isPhoneViewPort,} from "tools/page-tools";
import $ from "jquery";
import './header-ver2.sass'

class Header extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isMobile: isMobile(),
            isPhoneViewPort: isPhoneViewPort()
        }

        this._handleResize = function() {
            if (this.state.isMobile !== isMobile()) {
                this.setState({isMobile: isMobile()})
            }

            if (this.state.isPhoneViewPort !== isPhoneViewPort()) {
                this.setState({isPhoneViewPort: isPhoneViewPort()})
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

    render() {
        let {pageHeaderState, visible} = this.props,
            _menuOpened = pageHeaderState.showMenu,
            _headerClass = 'header-ver2 page-header' + (_menuOpened ? ' opened' : ' _fixed' + (!visible ? ' _animate' : ''))

        return (
            this.props.pageHeaderState.visibility ?
                <header className={_headerClass}>
                    <div className='page-header__row'>
                        {
                            this.state.isMobile ?
                                <MobileHeader isPhoneViewPort={this.state.isPhoneViewPort}/>
                                :
                                <DesktopHeader/>
                        }
                    </div>
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

function mapStateToProps(state,) {
    return {
        pageHeaderState: state.pageHeader,
    }
}

export default connect(mapStateToProps,)(Header);