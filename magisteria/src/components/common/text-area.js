import React from 'react'
import PropTypes from 'prop-types';
import './controls.sass'

export default class TextArea extends React.Component {

    static propTypes = {
        label: PropTypes.string,
        enableHtml: PropTypes.bool,
    }


    constructor(props) {
        super(props)

        this._id = new Date().getUTCMilliseconds()

        this._handlePaste = (e) => {
            const _data = (this.props.enableHtml) ? e.clipboardData.getData("text/html") : e.clipboardData.getData("text/plain")

            if (!_data) return

            let _value = this.props.enableHtml ? normalizeHtml(_data) : normalizeText(_data)

            if (_value !== _data) {
                e.preventDefault()
                window.document.execCommand(this.props.enableHtml ? 'insertHTML': 'insertText', false, _value);
            }

        }
    }

    render() {
        const {enableHtml, meta: {error, visited}, id, label, hidden, disabled} = this.props;
        const _errorText = visited && error &&
            <p className="form__error-message" style={{display: "block"}}>{error}</p>

        let _id = id ? id : this._id

        return (
            <div className="field-wrapper" style={hidden ? {display: 'none'} : null}>
                <label htmlFor={_id} className={"field-label" + (disabled ? " disabled" : "")}>{label}</label>
                <div className={"field-wrapper__editor-wrapper"}>
                    {enableHtml ? <HtmlTextArea id={_id} {...this.props} onPaste={::this._handlePaste}/> : <PlainTextArea id={_id} {...this.props} onPaste={::this._handlePaste}/>}
                    {_errorText}
                </div>
            </div>
        );
    }
}

function normalizeHtml(str) {
    return str && str.replace(/&nbsp;|\u202F|\u00A0/g, ' ');
}

function normalizeText(str) {
    return str && str.replace(/[\x00-\x1F]/gi, '');
}

class HtmlTextArea extends React.Component {
    render() {
        const {input, id, disabled,} = this.props;

        return (
            disabled ?
                <div dangerouslySetInnerHTML={{__html: input.value}} id={id}
                     className="field-textarea disabled"/>
                :
                <div contentEditable={true} dangerouslySetInnerHTML={{__html: input.value}}
                     id={id} className="field-textarea" onBlur={::this._onChange} onPaste={this.props.onPaste}/>
        )
    }

    _onChange(e) {
        let _value = e.target.innerHTML

        if (this.props.input.value !== _value) {
            this.props.input.onChange(_value);
        }
    }
}

class PlainTextArea extends React.Component {
    render() {
        const {input, id, disabled,} = this.props;

        return (
            disabled ?
                <div {...input} id={id} className={"field-textarea plain-text disabled"}>{input.value}</div>
                :
                <p contentEditable={true} {...input} id={id} className="field-textarea plain-text" onBlur={::this._onChange} onPaste={this.props.onPaste}>{input.value}</p>
        )
    }

    _onChange(e) {
        let _value = e.target.innerText

        let _array1 = _value.match(/[^\r\n]+/g),
            _array2 = this.props.input.value.match(/[^\r\n]+/g),
            _equals = (!_array1 && !_array2) || ((!!_array1 && !!_array2) && (_array1.length === _array2.length) && _array1.every((item, index) => {
                return item === _array2[index]
            }))

        if (!_equals) {
            this.props.input.onChange(_value);
        }
    }
}