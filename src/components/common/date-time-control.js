import React from 'react'
import PropTypes from 'prop-types';
import ReactDatetime from 'react-datetime'
// import styled, { injectGlobal } from 'styled-components'
// import { Label, Info, Error, Wrapper } from '../themes/default'
import './date-time-control.sass'

// injectGlobal`${vendorCss}`
//
// const StyledPicker = styled(ReactDatetime)`
//   input {
//     border: 1px solid ${props => props.error ? props.theme.danger : props.theme.gray};
//     border-radius: ${props => props.theme.radius};
//     height: ${props => props.theme.height};
//     padding: ${props => props.theme.padding};
//     width: 100%;
//   }
//   .rdtPicker {
//     padding: 0;
//   }
//
//   table {
//     border-collapse: collapse;
//     border-spacing: 0;
//     margin-top: 3px;
//   }
//   th, td {
//     border: 0;
//     padding: 0;
//     margin: 0;
//   }
//   thead {
//     background: ${props => props.theme.lightgray}
//   }
//   &:focus {
//     border-color: ${props => props.error ? props.theme.danger : props.theme.primary};
//     outline: none;
//   }
//   &:hover {
//     cursor: pointer;
//   }
// `

class Datepicker extends React.Component {
    static propTypes = {
        error: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
        label: PropTypes.string,
        info: PropTypes.string,
        input: PropTypes.object, // passed in by redux-form
        className: PropTypes.string,
        placeholder: PropTypes.string,
    }

    handleChange(args) {
        const {onChange, input} = this.props
        if (onChange) onChange(args)
        if (input) input.onChange(args)
    }

    handleFocus(e) {
        const {onFocus, input} = this.props
        if (onFocus) onFocus(e)
        if (input) input.onFocus(e)
    }

    handleBlur(e) {
        const {onBlur, input} = this.props
        if (onBlur) onBlur()
        if (input) input.onBlur()
    }

    render() {
        const {error, value, input, className, label, info, meta, placeholder, hidden, disabled, id} = this.props
        const reduxFormError = (meta) => (meta && meta.invalid && meta.touched) ? meta.error : null
        const currentValue = input ? input.value : value
        const errorMessage = input ? reduxFormError(meta) : error

        const _error = errorMessage &&
            <p className="form__error-message" style={{display: "block"}}>{errorMessage}</p>

        return (
            <div className="field-wrapper" style={hidden ? {display: 'none'} : null}>
                <label htmlFor={id} className={"field-label" + (disabled ? " disabled" : "")}>{label}</label>
                <div className={"field-wrapper__editor-wrapper"}>
                    <ReactDatetime
                        inputProps={{
                            placeholder: placeholder || 'Укажите дату',
                            disabled: disabled,
                        }}
                        {...this.props}
                        selected={currentValue}
                        onChange={this.handleChange.bind(this)}
                        onFocus={this.handleFocus.bind(this)}
                        onBlur={::this.handleBlur}
                        closeOnSelect={true}
                        dateFormat={"DD MMMM YYYY"}
                        locale={"ru-ru"}
                        timeFormat={false}
                        value={currentValue}
                        defaultValue={currentValue}
                        error={!!errorMessage}/>
                    {_error}
                </div>
            </div>
        )
    }
}

export default Datepicker