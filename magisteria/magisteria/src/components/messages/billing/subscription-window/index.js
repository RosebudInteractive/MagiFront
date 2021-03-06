import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {
    showBillingWindowSelector,
    billingStepSelector,
    loadingSelector,
    // isRedirectActiveSelector,
    BillingStep,
    hideBillingWindow,
    redirectComplete,
    // isRedirectUrlSelector
} from "ducks/billing";

import Subscription from '../controls/forms/subscription-form'
import Payment from '../controls/forms/payment-form'
import $ from "jquery";
import {enabledSubscriptionSelector} from "ducks/app";
import Platform from "platform";

class SubscriptionWindow extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            opened: false,
            isIE: Platform.name === 'IE',
        }
    }

    // componentWillReceiveProps(nextProps) {
    //     if ((nextProps.needRedirect) && (!this.props.needRedirect)) {
    //
    //         this.props.complete();
    //         window.location = nextProps.redirectUrl;
    //     }
    // }

    componentDidUpdate(prevProps) {
        if (!prevProps.showBillingWindow && this.props.showBillingWindow) {
            this._onShow()
        }

        if (prevProps.showBillingWindow && !this.props.showBillingWindow) {
            this._onHide()
        }

        if (prevProps.showSignInForm && !this.props.showSignInForm && !this.props.authorized) {
            this._onCloseClick()
        }
    }

    _onShow() {
        setTimeout(() => {
            $('body').addClass('modal-open');
            this.setState({
                opened: true
            })
        }, 100)
    }

    _onHide() {
        $('body').removeClass('modal-open');
        this.setState({
            opened: false
        })
    }

    _getStep() {
        let {billingStep: step, loading,} = this.props;

        switch (step) {
            case BillingStep.subscription:
                return <Subscription/>

            case BillingStep.payment:
                return <Payment loading={loading}/>

            default:
                return null;
        }
    }

    _onCloseClick() {
        this.setState({
            opened: false
        })

        setTimeout(() => {
            this.props.close()
        }, 300)

    }

    render() {
        let {showBillingWindow, enabledBilling, showSignInForm} = this.props;

        const _className = "modal-overlay modal-wrapper js-modal-wrapper" +
            (this.state.isIE ? ' ms-based' : '') +
            (this.state.opened ? ' is-opened' : ' invisible')

        return (showBillingWindow && enabledBilling && !showSignInForm) ?
            <div className={_className}>
                <div className="modal _billing billing-steps is-opened" id="billing">
                    <button type="button" className="modal__close js-modal-close" data-target="billing"
                            onClick={::this._onCloseClick}>??????????????
                    </button>
                    {this._getStep()}
                </div>
            </div>
            :
            null
    }
}

function mapStateToProps(state) {
    return {
        showSignInForm: state.app.showSignInForm,
        showBillingWindow: showBillingWindowSelector(state),
        billingStep: billingStepSelector(state),
        loading: loadingSelector(state),
        // needRedirect: isRedirectActiveSelector(state),
        // redirectUrl: isRedirectUrlSelector(state),
        authorized: !!state.user.user,
        enabledBilling: enabledSubscriptionSelector(state),

        error: state.user.error,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        close: bindActionCreators(hideBillingWindow, dispatch),
        complete: bindActionCreators(redirectComplete, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SubscriptionWindow);