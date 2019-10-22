import React from "react";
import {connect} from "react-redux";
import {bindActionCreators} from 'redux';
import {Redirect} from 'react-router';

import {userSelector, loadingSelector as profileLoading, errorSelector, getUserProfile} from 'ducks/profile'
import {enabledBillingSelector, fetchingSelector as appOptionsLoading} from 'ducks/app'

import * as pageHeaderActions from '../actions/page-header-actions';
import * as appActions from '../actions/app-actions';
import * as userActions from "../actions/user-actions";

import SubscriptionBlock from '../components/profile/subscription/subscription-block'
import HistoryBlock from '../components/profile/history/history-block'
import ProfileBlock from '../components/profile/settings/profile-block'

import {pages} from '../tools/page-tools';

class ProfilePage extends React.Component {

    constructor(props) {
        super(props);

        this._redirect = false

        this.state = {
            showSubscription: false,
            showHistory: false,
            showProfile: false,
        };
    }

    componentWillMount() {
        window.scrollTo(0, 0)
        this.props.getUserProfile();
        switch (this.props.page) {
            case '/history': {
                this.props.pageHeaderActions.setCurrentPage(pages.history);
                return
            }

            case '/profile': {
                this.props.pageHeaderActions.setCurrentPage(pages.profile);
                return
            }

            default: {
                this.props.pageHeaderActions.setCurrentPage(pages.profile);
            }

        }

    }

    componentWillReceiveProps(nextProps) {
        if ((this.props.loading) && (!nextProps.loading)) {
            if (nextProps.error === "Authorization required!") {
                this._redirect = true;
                this.forceUpdate();
                let _needOnlyRedirect = (nextProps.page === '/subscription') && !this.props.enabledBilling
                if (!_needOnlyRedirect) {
                    this.props.userActions.showSignInForm();
                }
            }
        }

        if ((this.props.user) && (!nextProps.user)) {
            this._redirect = true;
            this.forceUpdate();
        }

        let _showSubscription = nextProps.page === '/subscription' && this.props.enabledBilling,
            _showHistory = nextProps.page === '/history',
            _showProfile = nextProps.page === '/profile',
            _needUpdateState = (this.state.showSubscription !== _showSubscription) ||
                (this.state.showHistory !== _showHistory) ||
                (this.state.showProfile !== _showProfile)

        if (_needUpdateState) {
            this.setState({
                showSubscription: nextProps.page === '/subscription',
                showHistory: nextProps.page === '/history',
                showProfile: nextProps.page === '/profile'
            })
        }


    }

    componentDidUpdate() {
        document.title = 'Магистерия: Личный кабинет';
    }

    _openSubscription() {
        this.props.history.replace('/subscription')
    }

    _openHistory() {
        this.props.history.replace('/history')
        this.props.pageHeaderActions.setCurrentPage(pages.history);
    }

    _openProfile() {
        this.props.history.replace('/profile')
        this.props.pageHeaderActions.setCurrentPage(pages.profile);
    }

    render() {
        let {profile} = this.props;

        if (this._redirect) {
            this._redirect = false;
            return <Redirect push to={'/'}/>;
        }

        return (
            <div>
                {
                    profile ?
                        <div className="profile-page" style={{paddingTop: 95}}>
                            <div className="profile-block js-tabs">
                                <header className="profile-block__header">
                                    <div className="profile-block__header-col">
                                        <div className="profile-block__name">{profile.DisplayName}</div>
                                    </div>
                                    <div className="profile-block__header-col">
                                        <div className="profile-block__tab-controls">
                                            <ul>
                                                {
                                                    this.props.enabledBilling ?
                                                        <li className={"profile-block__tab-control" + (this.state.showSubscription ? " active" : "")}
                                                            onClick={::this._openSubscription}>
                                                            <span className="text">Платежи</span>
                                                        </li>
                                                        :
                                                        null
                                                }
                                                <li className={"profile-block__tab-control" + (this.state.showHistory ? " active" : "")}
                                                    onClick={::this._openHistory}>
                                                    <span className="text">История</span>
                                                </li>
                                                <li className={"profile-block__tab-control" + (this.state.showProfile ? " active" : "")}
                                                    onClick={::this._openProfile}>
                                                    <span className="text">Настройки</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </header>
                                <div className="profile-block__body">
                                    <SubscriptionBlock active={this.state.showSubscription}/>
                                    <HistoryBlock active={this.state.showHistory}/>
                                    <ProfileBlock active={this.state.showProfile}/>
                                </div>
                            </div>
                        </div>
                        :
                        null
                }
            </div>
        )
    }
}

function mapStateToProps(state, ownProps) {
    return {
        profile: userSelector(state),
        loading: profileLoading(state) || appOptionsLoading(state),
        error: errorSelector(state),
        user: state.user.user,
        pageHeaderState: state.pageHeader,
        page: ownProps.match.path,
        enabledBilling: enabledBillingSelector(state)
    }
}

function mapDispatchToProps(dispatch) {
    return {
        userActions: bindActionCreators(userActions, dispatch),
        pageHeaderActions: bindActionCreators(pageHeaderActions, dispatch),
        appActions: bindActionCreators(appActions, dispatch),
        getUserProfile: bindActionCreators(getUserProfile, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProfilePage);