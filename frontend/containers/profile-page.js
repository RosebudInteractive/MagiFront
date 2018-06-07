import React from "react";
import {connect} from "react-redux";
import {bindActionCreators} from 'redux';

import {userSelector, loadingSelector, getUserProfile} from '../ducks/profile'

import * as pageHeaderActions from '../actions/page-header-actions';
import * as appActions from '../actions/app-actions';
import HistoryBlock from '../components/profile/history-block'
import ProfileBlock from '../components/profile/profile-block'

import {pages} from '../tools/page-tools';

class ProfilePage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            showHistory: false,
            showProfile: false
        };
    }

    componentWillMount() {
        this.props.getUserProfile();
        this.props.pageHeaderActions.setCurrentPage(pages.profile);

    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            showHistory: nextProps.page === '/history',
            showProfile: nextProps.page === '/profile'
        })
    }

    componentDidUpdate() {
        document.title = 'Магистерия: Личный кабинет';
        this.props.appActions.hideUserBlock();
    }

    _openHistory() {
        this.props.history.replace('/history')
    }

    _openProfile() {
        this.props.history.replace('/profile')
    }

    render() {
        let {profile, loading} = this.props;

        return (
            <div>
                {
                    loading ?
                        <p>Загрузка...</p>
                        :
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
                                        <HistoryBlock active={this.state.showHistory}/>
                                        <ProfileBlock active={this.state.showProfile}/>
                                    </div>
                                </div>
                            </div> : null
                }
            </div>
        )
    }
}

function mapStateToProps(state, ownProps) {
    return {
        profile: userSelector(state),
        loading: loadingSelector(state),
        page: ownProps.match.path,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        pageHeaderActions: bindActionCreators(pageHeaderActions, dispatch),
        appActions: bindActionCreators(appActions, dispatch),
        getUserProfile: bindActionCreators(getUserProfile, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProfilePage);