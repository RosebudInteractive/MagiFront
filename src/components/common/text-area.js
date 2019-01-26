import React from 'react'
import PropTypes from 'prop-types';
import './controls.sass'

export default class TextArea extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            descr: props.defaultValue
        }

        this._handlePaste = (e) => {
            e.preventDefault();
            e.stopPropagation();

            let text = (e.originalEvent || e).clipboardData.getData('text/html');
            text = normalizeHtml(text)

            const activeElem = document.activeElement;

            if (!activeElem) return false;

            this.setState({descr: text});
        }
    }

    componentDidMount() {
        $('.field-textarea').bind('paste', this._handlePaste)
    }

    componentDidUpdate(prevProps) {
        if (prevProps.defaultValue !== this.props.defaultValue) {
            this.props.input.onChange(this.props.defaultValue)
            this.setState({descr: this.props.defaultValue})
        }
    }

    componentWillUnmount() {
        $('.field-textarea').unbind('paste', this._handlePaste)
    }

    static propTypes = {
        label: PropTypes.string
    }

    render() {
        const {input, meta: {error, visited}, id, label, disabled, hidden} = this.props;
        const _errorText = visited && error &&
            <p className="form__error-message" style={{display: "block"}}>{error}</p>

        return (
            <div className="field-wrapper" style={hidden ? {display: 'none'} : null}>
                <label htmlFor={id} className="field-label">{label}</label>
                <div className={"field-wrapper__editor-wrapper"}>
                    {disabled ?
                        <div dangerouslySetInnerHTML={{__html: this.state.descr}} {...input} id={id}
                             className="field-textarea" disabled/>
                        :
                        <div contentEditable={true} dangerouslySetInnerHTML={{__html: this.state.descr}} {...input}
                             id={id} className="field-textarea" onBlur={::this._onChange}/>
                    }
                    {_errorText}
                </div>
            </div>
        );
    }

    _onChange(e) {
        if (this.props.input.value !== e.target.innerHTML) {
            this.props.input.onChange(e.target.innerHTML);
            // this.props.meta.touched = true;
        }
    }
}

function normalizeHtml(str) {
    return str && str.replace(/&nbsp;|\u202F|\u00A0/g, ' ');
}