import React from 'react';
import {connect} from 'react-redux';

import ButtonsBlock from './buttons-block'
import Form from './sign-in-form'

class SignInWrapper extends React.Component {

    render() {
        return <div className="register-block-wrapper">
            <ButtonsBlock/>
            <span className="register-block-wrapper__label">или</span>
            <Form/>
        </div>

    }
}

function mapStateToProps(state) {
    return {
        paused: state.player.paused,
        title: state.player.title,
        subTitle: state.player.subTitle,
    }
}

export default connect(mapStateToProps)(SignInWrapper);