import React from 'react';

export class LoginEdit extends React.Component {

    render() {
        const _checkGreen = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#check-green"/>',
            _failure = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#failure"/>'

        return (
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
        );
    }
}

export class PasswordEdit extends React.Component {

    render() {
        const _checkGreen = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#check-green"/>',
            _failure = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#failure"/>',
            _eye = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#eye"/>'

        return (
            <div className="form__field-wrapper register-form__field-wrapper  js-field-wrapper">
                <label for="password" class="form__field-label register-form__field-label">Пароль</label>
                <input type="password" id="password" class="form__field register-form__field" placeholder="Пароль"/>
                <span class="icon-eye">
                            <svg width="16" height="12" dangerouslySetInnerHTML={{__html: _eye}}/>
                        </span>
                <span className="status-icon">
                            <svg className="success" width="20" height="20"
                                 dangerouslySetInnerHTML={{__html: _checkGreen}}/>
                            <svg className="failure" width="16" height="16"
                                 dangerouslySetInnerHTML={{__html: _failure}}/>
                        </span>
            </div>
        );
    }
}

export class ErrorMessage extends React.Component {

    render() {
        const _checkGreen = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#check-green"/>',
            _failure = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#failure"/>',
            _eye = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#eye"/>'

        return (
            <div className="form__field-wrapper register-form__field-wrapper  js-field-wrapper">
                <label for="password" class="form__field-label register-form__field-label">Пароль</label>
                <input type="password" id="password" class="form__field register-form__field" placeholder="Пароль"/>
                <span class="icon-eye">
                            <svg width="16" height="12" dangerouslySetInnerHTML={{__html: _eye}}/>
                        </span>
                <span className="status-icon">
                            <svg className="success" width="20" height="20"
                                 dangerouslySetInnerHTML={{__html: _checkGreen}}/>
                            <svg className="failure" width="16" height="16"
                                 dangerouslySetInnerHTML={{__html: _failure}}/>
                        </span>
            </div>
        );
    }
}

export class   extends React.Component {

    render() {
        const _login = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#login"/>'

        return <div class="register-form__buttons">
            <a href="#" class="register-form__password-recovery">Забыли пароль?</a>
            <button class="btn btn--brown register-form__enter disabled">
                <span class="text">Войти</span>
                <span class="icon">
                                <svg width="16" height="16" dangerouslySetInnerHTML={{__html: _login}}/>
                            </span>
            </button>
        </div>
    }
}