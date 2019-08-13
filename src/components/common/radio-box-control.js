import React from 'react';
import PropTypes from 'prop-types';
import './controls.sass'

export default class RadioBoxControl extends React.Component {

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

        let _inputClass = "editor-wrapper__radio-box" + (extClass ? (' ' + extClass) : '')

        return (
            <div className="field-wrapper" style={hidden ? {display: 'none'} : null}>
                <label htmlFor={id} className={"field-label" + (disabled ? " disabled" : "")}>{label}</label>
                <div className={"field-wrapper__editor-wrapper"}>
                    <div className={_inputClass}>
                        {this._getRadioItems()}
                        {_errorText}
                    </div>
                </div>
            </div>
        );
    }

    _getRadioItems() {
        const {options, disabled, input} = this.props;

        return options ?
            options.map((item) => {
                return <div className={"radio-box__item-wrapper" + (disabled ? " disabled" : "")}>
                    <input name={input.name} type="radio" value={item.value} disabled={!!disabled}
                           onChange={::this._onChange} checked={item.value == input.value}/>
                    {item.text}
                </div>
            })
            :
            null
    }

    _onChange(e) {
        this.props.input.onChange(e.target.value)
    }
}