import React from 'react';
import {connect} from 'react-redux';

class SignInForm extends React.Component {

    render() {
        const _checkGreen = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#check-green"/>',
            _failure = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#failure"/>'

        return <form action="#" method="post" className="form register-form">
            <div className="form__field-wrapper register-form__field-wrapper">
                <label htmlFor="email" className="form__field-label register-form__field-label">Почта</label>
                <input type="email" id="email" className="form__field register-form__field" placeholder="Ваш E-mail"/>
                <span className="status-icon">
                            <svg className="success" width="20" height="20"
                                 dangerouslySetInnerHTML={{__html: _checkGreen}}/>
                            <svg className="failure" width="16" height="16"
                                 dangerouslySetInnerHTML={{__html: _failure}}/>
                        </span>
            </div>
            <button className="btn btn--brown register-form__submit disabled">Войти</button>
        </form>
    }
}

function mapStateToProps(state) {
    return {
        authorizationState: state.user.authorizationState,
    }
}

export default connect(mapStateToProps)(SignInForm);