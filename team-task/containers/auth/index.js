import React, {useCallback, useEffect, useMemo, useRef, useState} from "react"
import Logo from "tt-assets/svg/logo.svg";
import {connect} from "react-redux";
import {Field, Form} from "react-final-form";
import "./auth.sass"
import {TextBox} from "../../components/ui-kit";
import {EMAIL_REGEXP} from "../../../common/constants/common-consts";
import {errorSelector, sighIn} from "tt-ducks/auth";
import {bindActionCreators} from "redux";
import Recaptcha from "react-google-invisible-recaptcha";
import {reCaptureSelector} from "tt-ducks/app";

const requiredField = value => (value ? undefined : 'Обязательное поле');
const mustBeEmail = value => (EMAIL_REGEXP.test(value) ? undefined : 'Не соответствует формату почты');
const ComposeValidators = (...validators) => value =>
    validators.reduce((error, validator) => error || validator(value), undefined);

function Auth(props) {

    const {serverError, recaptchaSiteKey} = props

    const [captchaError, setCaptchaError] = useState(false)
    const [captchaReloading, setCaptchaReloading] = useState(true)
    let login = useRef(null).current
    let password = useRef(null).current

    const recaptcha = useRef(null)


    const sighIn = (values) => {
        if (captchaError || serverError) {
            recaptcha.current.reset();
            // this.props.clearSubmitErrors('SignInForm')

            setCaptchaError(false)
            setCaptchaReloading(true)
        }

        if (values.login && values.password) {
            login = values.login
            password = values.password

            recaptcha.current.execute();
        } else {
            recaptcha.current.reset();
        }
    }

    const _onResolved = function(){
        setCaptchaError(false)
        setCaptchaReloading(false)

        props.actions.sighIn({
            login: login,
            password: password,
            'g-recaptcha-response': recaptcha.current.getResponse()
        })
    }

    const _onCaptchaError = () => {
        setCaptchaError(true)
    }

    const _captchaError = useMemo(() => {
        return captchaError &&
            <p className="form__error-message" style={{display: "block"}}>Ошибка проверки captcha</p>
    }, [captchaError])

    return <div className="auth-page team-task">
        <div className="auth-page__wrapper">
            <div className="auth-page__header">
                <Logo/>
            </div>
            <Form onSubmit={sighIn}
                  render={(props) => {
                      return <form className="auth-page__window" onSubmit={props.handleSubmit}>
                          <h5 className="auth-page__window-title">
                              Вход в панель управления
                          </h5>
                          <Field name="login" component={TextBox} label={"Логин"}
                                 validate={ComposeValidators(requiredField, mustBeEmail)}/>
                          <Field name="password" component={TextBox} label={"Пароль"} type={"password"}
                                 validate={requiredField}/>
                          {_captchaError}
                          <div className="auth-page__window-buttons">
                              <button className="orange-button login-button"
                                      disabled={!props.valid || props.submitting}
                                      type={"submit"}>
                                  Войти
                              </button>
                          </div>
                      </form>
                  }}/>

            <Recaptcha ref={recaptcha}
                       sitekey={recaptchaSiteKey}
                       onResolved={_onResolved}
                       onError={_onCaptchaError}/>

            <div className="auth-page__footer">
                <a className="link-to-site" href={"https://magisteria.ru/"}>www.magisteria.ru</a>
            </div>
        </div>
    </div>

}

function mapStateToProps(state,) {
    return {
        serverError: errorSelector(state),
        recaptchaSiteKey: reCaptureSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({sighIn}, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Auth)
