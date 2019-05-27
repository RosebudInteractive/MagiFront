import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import {AUTHORIZATION_STATE} from '../constants/user'

import Wrapper from '../components/auth/auth-wrapper'

import * as userActions from '../actions/user-actions'
import {OverflowHandler} from "../tools/page-tools";
import {clearWaitingAuthorize} from "ducks/app";

class AuthPopup extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            noTransition: false
        }
    }

    static propTypes = {
        visible: PropTypes.bool,
    };

    static defaultProps = {
        visible: false
    };

    componentDidUpdate(prevProps) {
        if ((!prevProps.visible) && (this.props.visible)) {
            OverflowHandler.rememberScrollPos();
            OverflowHandler.turnOnWithPause();
            setTimeout(() => {
                this.setState({
                    noTransition: true
                })
            }, 700)
        }

        if ((prevProps.visible) && (!this.props.visible)) {
            // if ($(window).innerWidth() > 899) {
            if (!this.props.pageHeaderState.showMenu) {
                OverflowHandler.turnOff();
            }

            if (this.state.noTransition) {
                this.setState({
                    noTransition: false
                })
            }
        }
    }

    _close() {
        if (this.state.noTransition) {
            this.setState({
                noTransition: false
            })
        }

        this.props.userActions.closeSignInForm()
        this.props.clearWaitingAuthorize()
    }

    render() {
        let {visible} = this.props;

        return (
            <div className={"popup js-popup _registration" + (visible ? " opened" : "") + (this.state.noTransition ? ' no-transition' : '')}>
                <button className="popup-close js-popup-close" onClick={::this._close}>Закрыть</button>
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
        pageHeaderState: state.pageHeader,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        userActions: bindActionCreators(userActions, dispatch),
        clearWaitingAuthorize: bindActionCreators(clearWaitingAuthorize, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AuthPopup);