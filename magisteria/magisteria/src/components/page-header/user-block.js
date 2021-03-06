import React from 'react';
import {connect} from 'react-redux';
import {Redirect} from 'react-router';
import {bindActionCreators} from 'redux';
import * as userActions from '../../actions/user-actions'
import * as appActions from '../../actions/app-actions'
import {Link} from 'react-router-dom';
import * as pageHeaderActions from "../../actions/page-header-actions";
import {OverflowHandler, widthLessThan900} from "../../tools/page-tools";
import {enabledPaidCoursesSelector,} from "ducks/app";
import browserHistory from "../../history";

class UserBlock extends React.Component {

    constructor(props) {
        super(props);

        this._resizeHandler = () => {
            if (!widthLessThan900() && this.props.showUserBlock) {
                this.props.appActions.hideUserBlock()
            }
        }
    }

    componentDidMount() {
        // $(window).on('resize', this._resizeHandler)
    }

    componentWillUnmount() {
        // $(window).unbind('resize', this._resizeHandler)
    }

    _onClick() {
        if (this.props.showUserBlock && !widthLessThan900()) {
            this.props.appActions.hideUserBlock()
        } else {
            this.props.appActions.showUserBlock()
        }
    }

    componentDidUpdate() {
    }

    _onLogout() {
        this.props.userActions.logout()

        this.props.pageHeaderActions.hideMenu()
        OverflowHandler.turnOff();

        if (this.props.showUserBlock && (!widthLessThan900())) {
            this.props.appActions.hideUserBlock()
        }
    }

    _onHistoryClick() {
        this.props.pageHeaderActions.hideMenu()
        OverflowHandler.turnOff();
    }

    _onProfileClick() {
        this.props.pageHeaderActions.hideMenu()
        OverflowHandler.turnOff();
    }

    render() {
        const _logout = '<use xlink:href="#logout"/>',
            _style = {cursor: 'pointer'}

        if (this._redirectToHistory) {
            this._redirectToHistory = false;
            browserHistory.push('/history')
            return null
        }

        if (this._redirectToProfile) {
            this._redirectToProfile = false;
            browserHistory.push('/profile')
            return null
        }

        return (
            <div className={"user-block" + (this.props.showUserBlock ? ' opened' : '')}>
                <div className="user-block__header" onClick={::this._onClick}>
                    <p className="user-block__name">{this.props.user.DisplayName}</p>
                </div>
                {
                    this.props.showUserBlock ?
                        <ul className="user-tooltip">
                            <li>
                                <Link to={'/profile'} onClick={::this._onProfileClick}>??????????????????</Link>
                            </li>
                            <li>
                                <Link to={'/history'} onClick={::this._onHistoryClick}>??????????????</Link>
                            </li>
                            {
                                this.props.enabledPaidCourses
                                    ?
                                    <li>
                                        <Link to={'/purchases'} onClick={::this._onHistoryClick}>?????? ??????????????</Link>
                                    </li>
                                    :
                                    null
                            }
                            <li>
                                <div className="logout-btn" style={_style}
                                     onClick={::this._onLogout}>
                                    <svg width="15" height="16" dangerouslySetInnerHTML={{__html: _logout}}/>
                                    <span>??????????</span>
                                </div>
                            </li>
                        </ul>
                        :
                        null
                }
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        user: state.user.user,
        showUserBlock: state.app.showUserBlock,
        enabledPaidCourses: enabledPaidCoursesSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        userActions: bindActionCreators(userActions, dispatch),
        appActions: bindActionCreators(appActions, dispatch),
        pageHeaderActions: bindActionCreators(pageHeaderActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(UserBlock);
