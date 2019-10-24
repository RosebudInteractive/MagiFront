import React from "react";
import {Link} from "react-router-dom";
import {connect} from "react-redux";
import {pages} from "tools/page-tools";
import PropTypes from "prop-types";

class UserNavigator extends React.Component {

    static propTypes = {
        isPhoneViewPort: PropTypes.bool,
    };

    render() {
        const _filter = '<use xlink:href="#filter"/>',
            _flagFull = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#flag-full"/>'

        const {authorized, currentPage, isPhoneViewPort} = this.props

        return authorized && (
                isPhoneViewPort ?
                    <li className={"header-menu__item" + (currentPage === pages.bookmarks ? ' active' : '')}>
                        <Link to={'/favorites'}>
                            <svg width="14" height="23" dangerouslySetInnerHTML={{__html: _flagFull}}/>
                        </Link>
                    </li>
                    :
                    <React.Fragment>
                        <li className={"header-menu__item" + (currentPage === pages.bookmarks ? ' active' : '')}>
                            <Link to={'/favorites'}>
                                <svg width="10" height="16" dangerouslySetInnerHTML={{__html: _flagFull}}/>
                                {!isPhoneViewPort && <span className="item__title">Закладки</span>}
                            </Link>
                        </li>
                        <li className={"header-menu__item" + (currentPage === pages.history ? ' active' : '')}>
                            <Link to={'/history'}>
                                <svg width="16" height="16" dangerouslySetInnerHTML={{__html: _filter}}/>
                                <span className="item__title">История</span>
                            </Link>
                        </li>
                    </React.Fragment>
                )
    }
}

function mapStateToProps(state) {
    return {
        authorized: !!state.user.user,
        currentPage: state.pageHeader.currentPage,
    }
}

export default connect(mapStateToProps,)(UserNavigator)