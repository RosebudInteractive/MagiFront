import React from 'react';
import PropTypes from 'prop-types';
import './../controls.sass'
import InputMask from 'react-input-mask';
import {touch} from "redux-form";

const EMPTY_VALUE = "--",
    MASK_CHAR = "-",
    MASK = "99 ч. 99 мин. 99 сек."

export default class TimeInput extends React.Component {

    static propTypes = {
        id: PropTypes.string,
        type: PropTypes.string,
        label: PropTypes.string,
        placeholder: PropTypes.string,
        extClass: PropTypes.string
    };

    constructor(props) {
        super(props)

        this.state = { textValue : null }
    }

    componentDidMount() {
        if (this.props.input.value !== "") {
            this.setState({textValue : _convertToTime(this.props.input.value)})
        }
    }

    componentWillReceiveProps(nextProps) {
        if ((this.props.input.value !== nextProps.input.value) && !isNaN(nextProps.input.value)) {
            this.setState({textValue: _convertToTime(this.props.input.value)})
        }
    }

    render() {
        const {meta: {error, touched}, id, label, placeholder, disabled, hidden, extClass,} = this.props;
        const _errorText = touched && error &&
            <p className="form__error-message" style={{display: "block"}}>{error}</p>

        let _inputClass = "field-input" + (extClass ? (' ' + extClass) : '')

        return (
            <div className="field-wrapper" style={hidden ? {display: 'none'} : null}>
                <label htmlFor={id} className={"field-label" + (disabled ? " disabled" : "")}>{label}</label>
                <div className={"field-wrapper__editor-wrapper time-input"}>
                    <InputMask value={this.state.textValue}
                               disabled={disabled}
                               mask={MASK}
                               maskChar={MASK_CHAR}
                               className={_inputClass}
                               placeholder={placeholder}
                               onChange={::this._onChange}
                               onBlur={::this._onBlur}/>
                    {_errorText}
                </div>
            </div>
        );
    }

    _onChange = (event) => {
        this.setState({textValue : _lightCheck(event.target.value)})
    }

    _onBlur(event) {
        let _value = _tryParseValue(event.target.value)

        if (_value !== undefined) {
            this.props.input.onChange(_value)
        } else {
            this.props.input.onChange(Number.NaN)
        }

        this.props.meta.dispatch(touch(this.props.meta.form, this.props.input.name))
    }
}



const _lightCheck = (textValue) => {
    let hours = textValue.substring(0, 2),
        minutes = textValue.substring(6, 8),
        seconds = textValue.substring(14, 16)

    minutes = minutes.includes(MASK_CHAR) ? minutes : (+minutes > 59) ? "59" : minutes
    seconds = seconds.includes(MASK_CHAR) ? seconds : (+seconds > 59) ? "59" : seconds

    return `${hours} ч. ${minutes} мин. ${seconds} сек.`
}

const _convertToInt = (value) => {
    return (value === EMPTY_VALUE) ?
        0
        :
        isNaN(+value) ? undefined : +value
}

const _tryParseValue = (textValue) => {
    let hours = _convertToInt(textValue.substring(0, 2)),
        minutes = _convertToInt(textValue.substring(6, 8)),
        seconds = _convertToInt(textValue.substring(14, 16))

    if ((hours === undefined) || (minutes === undefined) || (seconds === undefined)) {
        return undefined
    }

    minutes = (minutes > 59) ? 59 : minutes
    seconds = (seconds > 59) ? 59 : seconds

    return seconds + minutes * 60 + hours * 60 * 60
}



const _convertToTime = (value) => {
    if (!value) {
        return ""
    } else {
        let hours = Math.floor(value / 3600);
        value %= 3600;
        let minutes = Math.floor(value / 60);
        let seconds = value % 60;

        return `${hours.toString().padStart(2, MASK_CHAR)} ч. ${minutes.toString().padStart(2, '0')} мин. ${seconds.toString().padStart(2, '0')} сек."`
    }
}