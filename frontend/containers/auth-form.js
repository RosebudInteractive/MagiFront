import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {AUTHORIZATION_STATE} from '../constants/user'

import Wrapper from '../components/auth/auth-wrapper'

import * as userActions from '../actions/user-actions'

class AuthPopup extends React.Component {

    render() {
        return (
            <div className="popup js-popup _registration opened">
                <button className="popup-close js-popup-close" onClick={::this.props.userActions.closeSignInForm}>Закрыть</button>
                <div className="sign-in-block">
                    {
                        this.props.authorizationState === AUTHORIZATION_STATE.START_SIGN_IN ?
                            [
                                <p className="sign-in-block__label" key={'label'}>Не зарегистрирован?</p>,
                                <button className="btn btn--light sign-in-block__link" onClick={::this.props.userActions.switchToSignUp} key={'button'}>Регистрация</button>
                            ]
                            :
                            [
                                <p className="sign-in-block__label" key={'label'}>Уже зарегистрирован?</p>,
                                <button className="btn btn--light sign-in-block__link" onClick={::this.props.userActions.switchToSignIn} key={'button'}>Вход</button>
                            ]
                    }

                </div>
                <Wrapper/>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        authorizationState: state.user.authorizationState,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        userActions: bindActionCreators(userActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AuthPopup);