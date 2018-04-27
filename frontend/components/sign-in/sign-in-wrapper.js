import React from 'react';
import {connect} from 'react-redux';

import ButtonsBlock from './buttons-block'
import SignInSubform from './sign-in-subform'
// import SignUpSubform from '../sign-up/sign-up-subform'

class SignInWrapper extends React.Component {

    render() {
        return <div className="register-block-wrapper">
            <ButtonsBlock/>
            <span className="register-block-wrapper__label">или</span>
            <SignInSubform/>
        </div>

    }
}

function mapStateToProps(state) {
    return {
        authorizationState: state.user.authorizationState,
    }
}

export default connect(mapStateToProps)(SignInWrapper);