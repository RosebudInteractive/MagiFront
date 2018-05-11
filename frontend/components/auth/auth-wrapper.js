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
        let {authorizationState : state} = this.props;
        return (state === AUTHORIZATION_STATE.START_SIGN_IN) && <SignInSubform onSubmit={::this.props.userActions.login} serverError={this.props.error} onStartRecovery={::this.props.userActions.switchToRecoveryPassword}/> ||
                (state === AUTHORIZATION_STATE.START_SIGN_UP) && <SignUpSubform onSubmit={::this.props.userActions.signUp} serverError={this.props.error}/> ||
                (state === AUTHORIZATION_STATE.SIGN_UP_SUCCESS) && <SuccessForm onSubmit={::this.props.userActions.signUp} serverError={this.props.error}/> ||
                (state === AUTHORIZATION_STATE.RECOVERY_PASSWORD) && <PwdRecoveryForm onSubmit={::this.props.userActions.recoveryPassword} serverError={this.props.error}/>
    }
}

function mapStateToProps(state) {
    return {
        authorizationState: state.user.authorizationState,
        error: state.user.error
    }
}

function mapDispatchToProps(dispatch) {
    return {
        userActions: bindActionCreators(userActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AuthWrapper);