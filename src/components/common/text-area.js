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

            setTimeout(() => {
                let _id = this.props.id ? this.props.id : this._id
                let _target = $('#' + _id)[0];

                let _descr = (this.props.enableHtml) && _target.innerHTML ? normalizeHtml(_target.innerHTML) : normalizeText(_target.innerText)

                this.props.input.onChange(_descr)
            }, 0);

        }
    }

    componentDidMount() {
        let _id = this.props.id ? this.props.id : this._id

        $('#' + _id).bind('paste', this._handlePaste)
    }

    componentWillUnmount() {
        let _id = this.props.id ? this.props.id : this._id

        $('#' + _id).unbind('paste', this._handlePaste)
    }

    render() {
        const {enableHtml, meta: {error, visited}, id, label, hidden} = this.props;
        const _errorText = visited && error &&
            <p className="form__error-message" style={{display: "block"}}>{error}</p>

        let _id = id ? id : this._id

        return (
            <div className="field-wrapper" style={hidden ? {display: 'none'} : null}>
                <label htmlFor={_id} className="field-label">{label}</label>
                <div className={"field-wrapper__editor-wrapper"}>
                    {enableHtml ? <HtmlTextArea id={_id} {...this.props}/> : <PlainTextArea id={_id} {...this.props}/>}
                    {_errorText}
                </div>
            </div>
        );
    }

    _onChange(e) {
        // let _value = this.props.enableHtml ? e.target.innerHTML : e.target.innerText
        //
        // if (this.props.input.value !== _value) {
        //     this.props.input.onChange(_value);
        // }
    }
}

function normalizeHtml(str) {
    return str && str.replace(/&nbsp;|\u202F|\u00A0/g, ' ');
}

function normalizeText(str) {
    return str && str.replace(/[^\x20-\xFF]/gi, '');
}

class HtmlTextArea extends React.Component {
    render() {
        const {input, id, disabled,} = this.props;

        return (
            disabled ?
                <div dangerouslySetInnerHTML={{__html: input.value}} {...input} id={id}
                     className="field-textarea" disabled/>
                :
                <div contentEditable={true} dangerouslySetInnerHTML={{__html: input.value}} {...input}
                     id={id} className="field-textarea" onBlur={::this._onChange}/>
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
                <div {...input} id={id} className="field-textarea plain-text" disabled>{input.value}</div>
                :
                <p contentEditable={true} {...input} id={id} className="field-textarea plain-text" onBlur={::this._onChange}>{input.value}</p>
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