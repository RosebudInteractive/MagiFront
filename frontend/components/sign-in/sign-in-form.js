import React from 'react';
import {connect} from 'react-redux';

class SignInForm extends React.Component {

    render() {
        return <form action="#" method="post" class="form register-form">
            <div class="form__field-wrapper register-form__field-wrapper">
                <label for="email" class="form__field-label register-form__field-label">Почта</label>
                <input type="email" id="email" class="form__field register-form__field" placeholder="Ваш E-mail"/>
                <span class="status-icon">
                            <svg class="success" width="20" height="20">
                                <use xlink:href="#check-green"></use>
                            </svg>
                            <svg class="failure" width="16" height="16">
                                <use xlink:href="#failure"></use>
                            </svg>
                        </span>
            </div>
            <button class="btn btn--brown register-form__submit disabled">Войти</button>
        </form>
    }
}

function mapStateToProps(state) {
    return {
        paused: state.player.paused,
        title: state.player.title,
        subTitle: state.player.subTitle,
    }
}

export default connect(mapStateToProps)(SignInForm);