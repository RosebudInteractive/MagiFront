import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as userActions from '../../../../../actions/user-actions'
import * as appActions from '../../../../../actions/app-actions'
import {Link} from 'react-router-dom';
import {hideMenu} from "../../../../../actions/page-header-actions";
import {OverflowHandler} from "tools/page-tools";
import {enabledPaidCoursesSelector,} from "ducks/app";
import "./user-block.sass"

class UserBlock extends React.Component {

    render() {
        const LOGOUT = '<use xlink:href="#logout"/>',
            {authorized, enabledPaidCourses, user} = this.props

        return authorized &&
            <div className={"mobile-menu__section user-block"}>
                <div className="user-block__display-name">{user.DisplayName}</div>
                <React.Fragment>

                    <Link className="menu-item" to={'/profile'} onClick={::this._hideMenu}>
                        <span className="underlined-item">
                            Настройки
                        </span>
                    </Link>
                    {/*<Link className="menu-item" to={'/history'} onClick={::this._hideMenu}>*/}
                    {/*    <span className="underlined-item">*/}
                    {/*        История*/}
                    {/*    </span>*/}
                    {/*</Link>*/}
                    {
                        enabledPaidCourses &&
                            <Link  className="menu-item" to={'/purchases'} onClick={::this._hideMenu}>
                                <span className="underlined-item">
                                    Мои покупки
                                </span>
                            </Link>
                    }
                    <div className="logout-btn" onClick={::this._onLogout}>
                        <div className="logout-btn__wrapper">
                            <svg width="15" height="16" dangerouslySetInnerHTML={{__html: LOGOUT}}/>
                            <div className="menu-item">
                                <span className="underlined-item">Выйти</span>
                            </div>
                        </div>
                    </div>
                </React.Fragment>
            </div>
    }


    _hideMenu() {
        this.props.hideMenu()
        OverflowHandler.turnOff();
    }

    _onLogout() {
        this.props.userActions.logout()

        this._hideMenu()
    }
}

function mapStateToProps(state) {
    return {
        authorized: !!state.user.user,
        user: state.user.user,
        enabledPaidCourses: enabledPaidCoursesSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        userActions: bindActionCreators(userActions, dispatch),
        appActions: bindActionCreators(appActions, dispatch),
        hideMenu: bindActionCreators(hideMenu, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(UserBlock);