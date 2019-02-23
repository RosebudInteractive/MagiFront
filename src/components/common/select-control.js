import React from 'react';
import PropTypes from 'prop-types';
import './controls.sass'

export default class SelectControl extends React.Component {

    static propTypes = {
        id: PropTypes.string,
        type: PropTypes.string,
        label: PropTypes.string,
        placeholder: PropTypes.string,
        extClass: PropTypes.string,
        options: PropTypes.array.required,
    };

    render() {
        const {input, meta: {error, touched}, id, label, placeholder, disabled, hidden, extClass,} = this.props;
        const _errorText = touched && error &&
            <p className="form__error-message" style={{display: "block"}}>{error}</p>

        let _inputClass = "field-input" + (input.value ? '' : ' select__empty_value') + (extClass ? (' ' + extClass) : '')

        return (
            <div className="field-wrapper" style={hidden ? {display: 'none'} : null}>
                <label htmlFor={id} className="field-label">{label}</label>
                <div className={"field-wrapper__editor-wrapper"}>
                    {disabled ?
                        <select {...input} id={id} className={_inputClass} placeholder={placeholder} defaultValue={"default"} value={input.value} disabled>
                            {this._getOptions()}
                        </select>
                        :
                        <select {...input} id={id} className={_inputClass} placeholder={placeholder}>
                            {this._getOptions()}
                        </select>
                    }
                    {_errorText}
                </div>
            </div>
        );
    }

    _getOptions() {
        let _options = this.props.options.map((item) => {
            return <option value={item.id}>{item.value}</option>
        })

        _options.unshift(<option className="select__placeholder" value="" disabled selected hidden>{this.props.placeholder}</option>)

        return _options
    }
}