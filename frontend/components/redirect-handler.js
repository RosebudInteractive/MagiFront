import React from 'react';
import {
    isRedirectActiveSelector as billingRedirectActive,
    isRedirectUrlSelector as billingRedirectUrl,
    redirectComplete as completeBillingRedirect,
} from "ducks/billing";
import {
    isRedirectActiveSelector as playerRedirectActive,
    redirectUrlSelector as playerRedirectUrl,
    completeRedirect as completePlayerRedirect,
} from "ducks/player";

import {connect} from "react-redux";
import {bindActionCreators} from 'redux';

class RedirectHandler extends React.PureComponent{
    UNSAFE_componentWillReceiveProps(nextProps) {
        if ((nextProps.billingRedirectActive) && (!this.props.billingRedirectActive)) {

            this.props.completeBillingRedirect();
            window.location = nextProps.billingRedirectUrl;
        }

        if ((nextProps.playerRedirectActive) && (!this.props.playerRedirectActive)) {

            this.props.completePlayerRedirect();

            if (window.location.pathname !== nextProps.playerRedirectUrl) {
                window.location = nextProps.playerRedirectUrl;
            }
        }
    }

    render() { return null; }
}

function mapStateToProps(state) {
    return {
        billingRedirectActive: billingRedirectActive(state),
        billingRedirectUrl: billingRedirectUrl(state),

        playerRedirectActive: playerRedirectActive(state),
        playerRedirectUrl: playerRedirectUrl(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        completeBillingRedirect: bindActionCreators(completeBillingRedirect, dispatch),
        completePlayerRedirect: bindActionCreators(completePlayerRedirect, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(RedirectHandler);