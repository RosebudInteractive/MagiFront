import React, {useRef, useEffect, useState} from 'react';
import PropTypes from 'prop-types';

const SVG = {
    CHECK_GREEN: '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#check-green"/>',
    FAILURE: '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#failure"/>'
}

const hidingChar = '●'


export default function PasswordEditor(props,) {
    const [hiddenValue, setHiddenValue] = useState("")

    const inputEl = useRef(null);
    let realPasswordMapper = [],
        tmpPasswordMapper = [],
        passwordLenMapper = [];

    useEffect(() => {
        if (inputEl && inputEl.current) {
            inputEl.current.onkeyup = _handleKeyUp
            inputEl.current.onblur = _onBlur
        }

        props.input.onChange({hiddenValue: "", realPassword: ""})
    }, [])

    const _handleKeyUp = (e) => {
        const _target = e.currentTarget
        if (!_target.id) {
            _target.id = Math.random().toString(36).substring(5);
        }

        if (!realPasswordMapper.hasOwnProperty(_target.id)) {
            realPasswordMapper[_target.id] = [];
        }

        let realPassword = realPasswordMapper[_target.id];

        tmpPasswordMapper[_target.id] = $(_target).val();
        let tmpPassword = tmpPasswordMapper[_target.id];

        passwordLenMapper[_target.id] = tmpPassword.length;
        let passwordLen = passwordLenMapper[_target.id];

        // Get current keyup character position.
        let currKeyupPos = _target.selectionStart;

        for (let i = 0; i < passwordLen; i++) {
            if (tmpPassword[i] !== hidingChar) {
                realPassword[i] = tmpPassword[i];
            }
        }

        if (passwordLen < realPassword.length) {
            let diff = realPassword.length - passwordLen;

            let key = e.keyCode || e.charCode;

            // Check if last keypress was backspace or delete
            if (key === 8 || key === 46) {
                realPassword.splice(currKeyupPos, diff);
            }
            // User highlighted and overwrote a portion of the password
            else {
                realPassword.splice(currKeyupPos - 1, diff + 1);
                realPassword.splice(currKeyupPos - 1, 0, tmpPassword[currKeyupPos - 1]);
            }
        }

        props.input.onChange({hiddenValue: tmpPassword.replace(/./g, hidingChar), realPassword: realPassword.join("")})
    }

    const _onBlur = (event) => {
        let realPassword = realPasswordMapper[event.target.id],
            tmpPassword = tmpPasswordMapper[event.target.id];

        props.input.onChange({hiddenValue: tmpPassword.replace(/./g, hidingChar), realPassword: realPassword.join("")})

        const {onBlur, input} = props
        if (onBlur) onBlur()
        if (input) input.onBlur()
    }

    const {input, meta: {error, touched}, id, disabled, hidden, extClass} = props,
        _className = "form__field register-form__field" + (extClass ? " " + extClass : "")

    const _errorText = touched && error &&
        <p className="form__error-message js-error-message" style={{display: "block"}}>{error}</p>

    return <div className="form__field-wrapper register-form__field-wrapper" style={hidden ? {display: 'none'} : null}>
        <label htmlFor={id} className="form__field-label register-form__field-label">Пароль</label>
        {
            disabled ?
                <input ref={inputEl} {...input} id={id} type="text" className={_className} placeholder={"Пароль"} disabled/>
                :
                <input ref={inputEl} {...input} id={id} type="text" className={_className} placeholder={"Пароль"} value={input.value.hiddenValue}/>
        }

        {
            touched ?
                <span className="status-icon">
                    {
                        error ?
                            <svg className="failure" width="16" height="16" style={{display: "block"}}
                                 dangerouslySetInnerHTML={{__html: SVG.FAILURE}}/>
                            :
                            <svg className="success" width="20" height="20" style={{display: "block"}}
                                 dangerouslySetInnerHTML={{__html: SVG.CHECK_GREEN}}/>
                    }
                </span>
                :
                null
        }
        {_errorText}
    </div>
}

PasswordEditor.propTypes = {
    id: PropTypes.string,
};