import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import * as userActions from '../../actions/user-actions'

import PasswordConfirmSubform from './subform'
import MessageSubform from './message-subform'

import {AUTHORIZATION_STATE} from '../../constants/user'

class Wrapper extends React.Component {

    UNSAFE_componentWillReceiveProps(nextProps) {
        if ((nextProps.needRedirect) && (!this.props.needRedirect)) {

            this.props.userActions.redirectComplete();
            window.location = nextProps.redirectUrl;
        }
    }


    render() {
        let {authorizationState : state, error, user, loading} = this.props;

        return (state === AUTHORIZATION_STATE.PASSWORD_CONFIRM) && <PasswordConfirmSubform loading={loading} onSubmit={::this.props.userActions.sendNewPassword} serverError={error} user={user} activationKey={this.props.activationKey}/> ||
                (state === AUTHORIZATION_STATE.PASSWORD_CONFIRM_FINISHED) && <MessageSubform serverError={error}/>
    }
}

function mapStateToProps(state) {
    return {
        authorizationState: state.user.authorizationState,
        error: state.user.error,
        user: state.user.user,
        loading: state.user.loading,
        needRedirect: state.user.redirect.active,
        redirectUrl: state.user.redirect.url,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        userActions: bindActionCreators(userActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Wrapper);