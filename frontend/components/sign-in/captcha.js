import React from 'react';
import Recaptcha from 'react-recaptcha';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import * as userActions from '../../actions/user-actions'

class Captcha extends React.Component {

    static propTypes = {};

    static defaultProps = {};

    _expiredCallback() {
        this.props.userActions.clearCaptcha()
    }

    _verifyCallback(response) {
        this.props.userActions.setCaptcha(response)
    }

    render() {
        return (
            <Recaptcha
                sitekey="6LfobE8UAAAAAMR-Sj4I2ZYe_N74atRFN5jqhk6t"
                // render="explicit"
                // onloadCallback={verifyCallback}
                verifyCallback ={::this._verifyCallback}
                expiredCallback={::this._expiredCallback}
                theme="dark"
            />
        );
    }
}

function mapStateToProps(state) {
    return {
        authorizationState: state.user.authorizationState,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        userActions: bindActionCreators(userActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Captcha);