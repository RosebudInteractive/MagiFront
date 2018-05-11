import React from 'react';
import PropTypes from 'prop-types';
import Recaptcha from 'react-recaptcha';

export default class Captcha extends React.Component {

    static propTypes = {
        onSetCapture: PropTypes.func.require,
        onClearCaptcha: PropTypes.func,
    };

    static defaultProps = {};

    _expiredCallback() {
        if (this.props.onClearCaptcha) {
            this.props.onClearCaptcha()
        }
    }

    _verifyCallback(response) {
        if (this.props.onSetCapture) {
            this.props.onSetCapture(response)
        }
    }

    render() {
        return (
            <Recaptcha
                sitekey="6LfobE8UAAAAAMR-Sj4I2ZYe_N74atRFN5jqhk6t"
                verifyCallback ={::this._verifyCallback}
                expiredCallback={::this._expiredCallback}
                theme="dark"
                hl={'ru'}
            />
        );
    }
}