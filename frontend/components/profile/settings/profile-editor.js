import React from "react";
import PropTypes from "prop-types";

export default class ProfileEditor extends React.Component {

    static propTypes = {
        id: PropTypes.string,
        type: PropTypes.string,
        label: PropTypes.string,
        placeholder: PropTypes.string,
        disabled: PropTypes.bool,
        wrapperClass: PropTypes.string,
    };

    render() {
        const _checkGreen = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#check-green"/>',
            _failure = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#failure"/>';

        const {input, meta: {error, touched}, id, type, label, placeholder, disabled, wrapperClass} = this.props;
        const _errorText = touched && error &&
            <p className="form__error-message js-error-message" style={{display: "block"}}>{error}</p>

        return (
            <div className={wrapperClass}>
                <label htmlFor={id} className="form__field-label">{label}</label>
                {disabled ?
                    <input {...input} id={id} type={type} className="form__field" placeholder={placeholder} disabled/>
                    :
                    <input {...input} id={id} type={type} className="form__field" placeholder={placeholder}/>
                }
                {!disabled ?
                    touched ?
                        <span className="status-icon">
                                {error ?
                                    <svg className="failure" width="16" height="16" style={{display: "block"}}
                                         dangerouslySetInnerHTML={{__html: _failure}}/>
                                    :
                                    <svg className="success" width="20" height="20" style={{display: "block"}}
                                         dangerouslySetInnerHTML={{__html: _checkGreen}}/>
                                }
                            </span>
                        :
                        null
                    : null
                }
                {_errorText}
            </div>
        );
    }
}