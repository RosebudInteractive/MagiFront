import React from 'react';
import PropTypes from 'prop-types';
import Recaptcha from '../common/g-recaptcha';
import {connect} from "react-redux";

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
        return (
            <Recaptcha
                ref={e => recaptchaInstance = e}
                render="explicit"
                sitekey={this.props.reCapture}
                verifyCallback ={::this._verifyCallback}
                expiredCallback={::this._expiredCallback}
                theme="dark"
                onloadCallback={::this._onLoadCallback}
                hl={'ru'}
            />
        );
    }
}

function mapStateToProps(state) {
    return {
        reCapture: state.app.reCapture,
    }
}

export default connect(mapStateToProps)(Captcha);