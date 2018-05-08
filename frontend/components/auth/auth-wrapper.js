import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import * as userActions from '../../actions/user-actions'

import SignInSubform from './sign-in-subform'
import SignUpSubform from './sign-up-subform'

import {AUTHORIZATION_STATE} from '../../constants/user'

class AuthWrapper extends React.Component {

    render() {
        return (
            this.props.authorizationState === AUTHORIZATION_STATE.START_SIGN_IN ?
                <SignInSubform onSubmit={::this.props.userActions.login} serverError={this.props.error}/>
                :
                <SignUpSubform onSubmit={::this.props.userActions.signUp} serverError={this.props.error}/>
        )
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