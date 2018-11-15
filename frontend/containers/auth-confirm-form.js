import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';

import * as userActions from '../actions/user-actions'

class AuthConfirmForm extends React.Component {

    constructor(props) {
        super(props)
    }

    componentWillMount() {
        this.props.userActions.sendActivationKey(this.props.activationKey)
    }

    render() {
        let {error} = this.props;

        let _text = error ? <p>{'При активации произошла ошибка'} <br/>{error}</p> : <p>{'Активация прошла успешно'}</p>

        return (
            <div className="popup js-popup _registration opened no-transition">
                <div className="register-block-wrapper">
                    <div className='register-block-wrapper__logo'/>
                    <div className="success-message">
                        <p className="success-message__text">{_text}</p>
                    </div>

                    <Link to={'/'}
                          className="btn btn--white register-block__btn register-block__btn--fullwidth">
                        <span className="text">Ок</span>
                    </Link>
                </div>

            </div>
        )
    }
}

function mapStateToProps(state, ownProps) {
    return {
        error: state.user.error,
        activationKey: ownProps.match.params.activationKey
    }
}

function mapDispatchToProps(dispatch) {
    return {
        userActions: bindActionCreators(userActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AuthConfirmForm);