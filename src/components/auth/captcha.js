import React from 'react';
import PropTypes from 'prop-types';
import Recaptcha from './g-recaptcha';

let recaptchaInstance;

export default class Captcha extends React.Component {

    static propTypes = {
        onSetCapture: PropTypes.func,
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

    reset() {
        if (recaptchaInstance) {
            recaptchaInstance.reset()
        }
    }

    _onLoadCallback = function () {
        console.log('Done!!!!');
    };

    render() {
        return (
            <Recaptcha
                ref={e => recaptchaInstance = e}
                render="explicit"
                sitekey="6LfobE8UAAAAAMR-Sj4I2ZYe_N74atRFN5jqhk6t"
                verifyCallback ={::this._verifyCallback}
                expiredCallback={::this._expiredCallback}
                // theme="dark"
                onloadCallback={::this._onLoadCallback}
                hl={'ru'}
            />
        );
    }
}