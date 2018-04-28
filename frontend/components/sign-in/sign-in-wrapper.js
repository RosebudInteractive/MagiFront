import React from 'react';
import {connect} from 'react-redux';

import ButtonsBlock from './buttons-block'
import SignInSubform from './sign-in-subform'
import SignUpSubform from '../sign-up/sign-up-subform'

import {AUTHORIZATION_STATE} from '../../constants/user'

class SignInWrapper extends React.Component {

    render() {
        return <div className="register-block-wrapper">
            <ButtonsBlock/>
            <span className="register-block-wrapper__label">или</span>
            {
                this.props.authorizationState === AUTHORIZATION_STATE.START_SIGN_IN ?
                    <SignInSubform/>
                    :
                    <SignUpSubform/>
            }
        </div>

    }
}

function mapStateToProps(state) {
    return {
        authorizationState: state.user.authorizationState,
    }
}

export default connect(mapStateToProps)(SignInWrapper);