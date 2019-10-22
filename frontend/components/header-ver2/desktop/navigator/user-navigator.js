import React from "react";
import {Link} from "react-router-dom";
import {connect} from "react-redux";
import {pages} from "tools/page-tools";

class UserNavigator extends React.Component {

    render() {
        const _filter = '<use xlink:href="#filter"/>',
            _flagFull = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#flag-full"/>'

        return this.props.authorized &&
            <React.Fragment>
                <li className={"header-menu__item" + (this.props.currentPage === pages.bookmarks ? ' active' : '')}>
                    <Link to={'/favorites'}>
                        <svg width="9" height="15" dangerouslySetInnerHTML={{__html: _flagFull}}/>
                        <span className="item__title">Закладки</span>
                    </Link>
                </li>
                <li className={"header-menu__item" + (this.props.currentPage === pages.history ? ' active' : '')}>
                    <Link to={'/history'}>
                        <svg width="16" height="16" dangerouslySetInnerHTML={{__html: _filter}}/>
                        <span className="item__title">История</span>
                    </Link>
                </li>
            </React.Fragment>
    }
}

function mapStateToProps(state) {
    return {
        authorized: !!state.user.user,
        currentPage: state.pageHeader.currentPage,
    }
}

export default connect(mapStateToProps,)(UserNavigator)