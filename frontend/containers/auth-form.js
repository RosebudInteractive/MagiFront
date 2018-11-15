import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import {AUTHORIZATION_STATE} from '../constants/user'

import Wrapper from '../components/auth/auth-wrapper'

import * as userActions from '../actions/user-actions'
import $ from "jquery";

class AuthPopup extends React.Component {

    constructor(props) {
        super(props);
    }

    static propTypes = {
        visible: PropTypes.bool,
    };

    static defaultProps = {
        visible: false
    };

    componentDidUpdate(prevProps) {
        if ((!prevProps.visible) && (this.props.visible)) {
            $('body').addClass('overflow');
        }

        if ((prevProps.visible) && (!this.props.visible)) {
            if ($(window).innerWidth() > 899) {
                $('body').removeClass('overflow');
            }
        }
    }

    render() {
        let {visible} = this.props;

        return (
            <div className={"popup js-popup _registration" + (visible ? " opened" : "")}>
                <button className="popup-close js-popup-close" onClick={::this.props.userActions.closeSignInForm}>Закрыть</button>
                <div className="sign-in-block">
                    {
                        this.props.authorizationState === AUTHORIZATION_STATE.START_SIGN_IN ?
                            [
                                <p className="sign-in-block__label" key={'label'}>Не зарегистрированы?</p>,
                                <button className="btn btn--light sign-in-block__link" onClick={::this.props.userActions.switchToSignUp} key={'button'}>Регистрация</button>
                            ]
                            :
                            [
                                <p className="sign-in-block__label" key={'label'}>Уже зарегистрированы?</p>,
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