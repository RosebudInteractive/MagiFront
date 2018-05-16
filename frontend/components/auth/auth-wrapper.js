import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import * as userActions from '../../actions/user-actions'

import SignInSubform from './sign-in-subform'
import SignUpSubform from './sign-up-subform'
import SuccessForm from './success-form'
import PwdRecoveryForm from './password-recovery-form'

import {AUTHORIZATION_STATE} from '../../constants/user'

class AuthWrapper extends React.Component {

    render() {
        let {authorizationState : state, loading, error, userActions} = this.props;
        return (state === AUTHORIZATION_STATE.START_SIGN_IN) && <SignInSubform loading={loading} onSubmit={::userActions.login} serverError={error} onStartRecovery={::userActions.switchToRecoveryPassword}/> ||
                (state === AUTHORIZATION_STATE.START_SIGN_UP) && <SignUpSubform loading={loading} onSubmit={::userActions.signUp} serverError={error}/> ||
                (state === AUTHORIZATION_STATE.SIGN_UP_SUCCESS) && <SuccessForm serverError={error} enableCountdown={true}/> ||
                (state === AUTHORIZATION_STATE.RECOVERY_PASSWORD_SUCCESS) && <SuccessForm serverError={error} enableCountdown={false}/> ||
                (state === AUTHORIZATION_STATE.RECOVERY_PASSWORD) && <PwdRecoveryForm loading={loading} onSubmit={::userActions.recoveryPassword} serverError={error} email={this.props.email}/>
    }
}

function mapStateToProps(state) {
    return {
        authorizationState: state.user.authorizationState,
        error: state.user.error,
        email: state.user.email,
        loading: state.user.loading,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        userActions: bindActionCreators(userActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AuthWrapper);