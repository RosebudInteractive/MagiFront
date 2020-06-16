import React from "react";
import {Link} from "react-router-dom";
import {connect} from "react-redux";
import {OverflowHandler, pages} from "tools/page-tools";
import PropTypes from "prop-types";
import {bindActionCreators} from "redux";
import {hideMenu} from "actions/page-header-actions";

class UserNavigator extends React.Component {

    static propTypes = {
        isPhoneViewPort: PropTypes.bool,
    };

    render() {
        const HISTORY = '<use xlink:href="#history"/>',
            FLAG_FULL = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#flag-full"/>'

        const {authorized, currentPage, isPhoneViewPort} = this.props

        return authorized && (
                isPhoneViewPort ?
                    <li className={"header-menu__item" + (currentPage === pages.bookmarks ? ' active' : '')}>
                        <Link to={'/favorites'} onClick={::this._onLinkClick}>
                            <svg width="14" height="23" dangerouslySetInnerHTML={{__html: FLAG_FULL}}/>
                        </Link>
                    </li>
                    :
                    <React.Fragment>
                        <li className={"header-menu__item" + (currentPage === pages.bookmarks ? ' active' : '')}>
                            <Link to={'/favorites'} onClick={::this._onLinkClick}>
                                <svg width="10" height="16" dangerouslySetInnerHTML={{__html: FLAG_FULL}}/>
                                {!isPhoneViewPort && <span className="item__title">Закладки</span>}
                            </Link>
                        </li>
                        <li className={"header-menu__item" + (currentPage === pages.history ? ' active' : '')}>
                            <Link to={'/history'} onClick={::this._onLinkClick}>
                                <svg width="16" height="16" dangerouslySetInnerHTML={{__html: HISTORY}}/>
                                <span className="item__title">История</span>
                            </Link>
                        </li>
                    </React.Fragment>
                )
    }

    _onLinkClick() {
        this.props.hideMenu()
        OverflowHandler.turnOff();
    }
}

function mapStateToProps(state) {
    return {
        authorized: !!state.user.user,
        currentPage: state.pageHeader.currentPage,
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({hideMenu}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(UserNavigator)
