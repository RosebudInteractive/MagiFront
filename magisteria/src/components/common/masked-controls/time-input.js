import React from 'react';
import PropTypes from 'prop-types';
import './../controls.sass'
import InputMask from 'react-input-mask';

export const LAST_UNIT = {SECOND : "SECOND", MINUTES: "MINUTES", HOURS: "HOURS"}

const EMPTY_VALUE = ["••", "•0", "0•"],
    MASK_CHAR = "•",
    MASK_WITH_SECONDS = "99 ч. 99 мин. 99 сек.",
    MASK_WITH_MINUTES = "99 ч. 99 мин."

export default class TimeInput extends React.Component {

    static propTypes = {
        id: PropTypes.string,
        type: PropTypes.string,
        label: PropTypes.string,
        placeholder: PropTypes.string,
        extClass: PropTypes.string,
        lastUnit: PropTypes.string
    };

    static defaultProps = {
        lastUnit: LAST_UNIT.SECOND
    }

    constructor(props) {
        super(props)

        this.state = { textValue : null }
    }

    componentDidMount() {
        if (this.props.input.value !== "") {
            this.setState({textValue : _convertToTime(this.props.input.value)})
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if ((this.props.input.value !== nextProps.input.value) && !isNaN(nextProps.input.value)) {
            this.setState({textValue: _convertToTime(nextProps.input.value)})
        }
    }

    render() {
        const {meta: {error, touched}, id, label, placeholder, disabled, hidden, extClass, lastUnit} = this.props;
        const _errorText = touched && error &&
            <p className="form__error-message" style={{display: "block"}}>{error}</p>

        let _inputClass = "field-input" + (extClass ? (' ' + extClass) : '')

        return (
            <div className="field-wrapper" style={hidden ? {display: 'none'} : null}>
                <label htmlFor={id} className={"field-label" + (disabled ? " disabled" : "")}>{label}</label>
                <div className={"field-wrapper__editor-wrapper time-input"}>
                    <InputMask value={this.state.textValue}
                               disabled={disabled}
                               mask={(lastUnit === LAST_UNIT.SECOND) ? MASK_WITH_SECONDS : MASK_WITH_MINUTES}
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
        this.setState({textValue : _lightCheck(event.target.value, this.props.lastUnit)})
    }

    _onBlur(event) {
        let _value = _tryParseValue(event.target.value, this.props.lastUnit)

        if (_value !== undefined) {
            this.props.input.onChange(_value)
        } else {
            this.props.input.onChange(Number.NaN)
        }

        const {onBlur, input} = this.props
        if (onBlur) onBlur()
        if (input) input.onBlur()
    }
}



const _lightCheck = (textValue, lastUnit) => {
    let hours = textValue.substring(0, 2),
        minutes = textValue.substring(6, 8),
        seconds = (lastUnit === LAST_UNIT.SECOND) ? textValue.substring(14, 16) : "00"

    minutes = minutes.includes(MASK_CHAR) ? minutes : (+minutes > 59) ? "59" : minutes
    seconds = seconds.includes(MASK_CHAR) ? seconds : (+seconds > 59) ? "59" : seconds

    return (lastUnit === LAST_UNIT.SECOND) ? `${hours} ч. ${minutes} мин. ${seconds} сек.` : `${hours} ч. ${minutes} мин.`
}

const _convertToInt = (value) => {
    return EMPTY_VALUE.some(item => item === value) ?
        0
        :
        isNaN(+value.replace(/•/g, "0")) ? undefined : +value.replace(/•/g, "0")
}

const _tryParseValue = (textValue, lastUnit) => {
    let hours = _convertToInt(textValue.substring(0, 2)),
        minutes = _convertToInt(textValue.substring(6, 8)),
        seconds = (lastUnit === LAST_UNIT.SECOND) ? _convertToInt(textValue.substring(14, 16)) : 0

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
