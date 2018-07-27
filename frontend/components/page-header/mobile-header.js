import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import * as tools from '../../tools/page-tools';

export default class MobileHeader extends React.Component {

    static propTypes = {
        onClickMenuTrigger: PropTypes.func.isRequired,
        currentPage: PropTypes.object.isRequired,
    };

    static defaultProps = {};


    render() {
        const _logo = '<use xlink:href="#logo-mob"/>'

        return (
            <div className="page-header__menu-mobile">
                <button type="button" className="menu-trigger" onClick={this.props.onClickMenuTrigger}><span>Меню</span>
                </button>
                <Link to={'/'} className="logo-mobile">
                    <svg width="70" height="38" dangerouslySetInnerHTML={{__html: _logo}}/>
                </Link>
                <nav className="navigation navigation-mobile">
                    <ul>
                        <li className={this.props.currentPage.name === tools.pages.courses.name ? "current" : ''}>
                            <Link to={tools.pages.courses.url}>Курсы</Link>
                        </li>
                        <li>
                            {/*<a href="#">Календарь</a>*/}
                        </li>
                    </ul>
                </nav>
            </div>
        )
    }
}
