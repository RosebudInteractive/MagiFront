import React from 'react';
import PropTypes from 'prop-types';
import Recaptcha from './g-recaptcha';
import {connect} from "react-redux";
import {reCaptureSelector} from "../../ducks/app";

let recaptchaInstance;

class Captcha extends React.Component {

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

    static reset() {
        if (recaptchaInstance) {
            recaptchaInstance.reset()
        }
    }

    _onLoadCallback = function () {
        console.log('Done!!!!');
    };

    render() {
        let {reCapture} = this.props

        return reCapture ?
            <Recaptcha
                ref={e => recaptchaInstance = e}
                render="explicit"
                sitekey={this.props.reCapture}
                verifyCallback={::this._verifyCallback}
                expiredCallback={::this._expiredCallback}
                // theme="dark"
                size={'invisible'}
                onloadCallback={::this._onLoadCallback}
                hl={'ru'}
            />
            :
            null
    }
}

function mapStateToProps(state) {
    return {
        reCapture: reCaptureSelector(state),
    }
}

export default connect(mapStateToProps)(Captcha);