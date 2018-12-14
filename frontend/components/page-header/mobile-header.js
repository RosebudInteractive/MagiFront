import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import { Link } from 'react-router-dom';

import {pages} from "../../tools/page-tools";
import SubscriptionButton from "./subscription-button";

class MobileHeader extends React.Component {

    static propTypes = {
        onClickMenuTrigger: PropTypes.func.isRequired,
        currentPage: PropTypes.object.isRequired,
    };

    static defaultProps = {};

    render() {
        const _logo = '<use xlink:href="#logo-mob"/>',
            _flagFull = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#flag-full"/>'

        return (
            <div className="page-header__menu-mobile">
                <button type="button" className="menu-trigger" onClick={this.props.onClickMenuTrigger}><span>Меню</span>
                </button>
                <Link to={'/'} className="logo-mobile">
                    <svg width="70" height="38" dangerouslySetInnerHTML={{__html: _logo}}/>
                </Link>

                <nav className="navigation navigation-mobile">
                    <ul>
                        <li className={this.props.currentPage.name === pages.courses.name ? "current" : ''}>
                            <Link to={pages.courses.url}>Курсы</Link>
                        </li>
                        {
                            this.props.authorized ?
                                <li className={"favorites" + (this.props.currentPage === pages.bookmarks ? ' active' : '')}
                                    onClick={this.props.onBookmarkClick}>
                                    <Link to={'/favorites'}>
                                        <span className="hidden">Закладки</span>
                                        <svg width="14" height="23" dangerouslySetInnerHTML={{__html: _flagFull}}/>
                                    </Link>
                                </li>
                                :
                                null
                        }
                    </ul>
                </nav>
                <SubscriptionButton isMobile={true}/>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        authorized: !!state.user.user,
    }
}

export default connect(mapStateToProps)(MobileHeader);
