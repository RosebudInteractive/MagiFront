import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import * as userActions from '../../actions/user-actions'

const _time = 60;

class AuthConfirmForm extends React.Component {

    constructor(props) {
        super(props)
        this._timer = null;
        this._time = _time;
        this._buttonDisabled = true;
    }

    componentDidMount() {
        // this.props.userActions.sendActivationKey(this.props.activationKey)
        this._startCountdown();
    }

    _startCountdown() {
        if (this.props.enableCountdown) {
            this._timer = setInterval(() => {
                this._time--;
                this._checkTime();
                this.forceUpdate();
            }, 1000)
        }
    }

    _checkTime() {
        if (this._time <= 0) {
            this._buttonDisabled = false;
            clearInterval(this._timer)
        }
    }

    _resend() {
        if (!this._buttonDisabled) {
            this.props.userActions.resendMessage(this.props.user.Id);
            this._time = _time;
            this._buttonDisabled = true;
            this._startCountdown();
        }
    }

    render() {
        let {email, msgUrl} = this.props

        return (
            <div className="register-block-wrapper">
                <div className='register-block-wrapper__logo'/>
                <div className="success-message">
                    <p className="success-message__text">{'Мы отправили письмо с дальнешими инструкциями на почту' + (email ? (' ' + email) : '')}</p>
                    {
                        NODE_ENV === 'development' ?
                            <a href={msgUrl} className="success-message__check-link">Открыть тестовое письмо</a>
                            :
                            null
                    }
                    {
                        this.props.enableCountdown ?
                            <div>
                                <p className="success-message__note">Письмо не пришло?</p>
                                <div
                                    className={this._buttonDisabled ? 'success-message__note' : 'success-message__link'}
                                    style={{margin: 0}} onClick={::this._resend}>Отправить еще раз
                                </div>
                                {this._buttonDisabled ? <div className="success-message__note"
                                                             style={{margin: 0}}>{'через ' + this._time + ' сек'}</div> : null}
                            </div>
                            :
                            null
                    }

                </div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        user: state.user.user,
        msgUrl: state.user.msgUrl,
        email: state.user.email,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        userActions: bindActionCreators(userActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AuthConfirmForm);