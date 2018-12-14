import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {
    showBillingWindowSelector,
    billingStepSelector,
    loadingSelector,
    BillingStep,
    hideBillingWindow
} from "../../ducks/billing";

import Subscription from './billing-subscription'
import Payment from './billing-payments'
import $ from "jquery";

class BillingWrapper extends React.Component {

    componentDidUpdate(prevProps) {
        if (!prevProps.showBillingWindow && this.props.showBillingWindow) {
            this._onShow()
        }

        if (prevProps.showBillingWindow && !this.props.showBillingWindow) {
            this._onHide()
        }
    }

    _onShow() {
        $('body').addClass('modal-open')
    }

    _onHide() {
        $('body').removeClass('modal-open')
    }

    _getStep() {
        let {billingStep: step, loading,} = this.props;

        return (step === BillingStep.subscription) && <Subscription/> ||
            (step === BillingStep.payment) && <Payment loading={loading}/> ||
            null
    }

    _onCloseClick() {
        this.props.close()
    }

    render() {
        let {showBillingWindow} = this.props;

        return showBillingWindow ?
            <div className="modal-overlay modal-wrapper js-modal-wrapper is-opened" data-name="billing">
                <div className="modal _billing billing-steps is-opened" id="billing">
                    <button type="button" className="modal__close js-modal-close" data-target="billing" onClick={::this._onCloseClick}>Закрыть</button>
                    {this._getStep()}
                </div>
            </div>
            :
            null
    }
}

function mapStateToProps(state) {
    return {
        showBillingWindow: showBillingWindowSelector(state),
        billingStep: billingStepSelector(state),
        loading: loadingSelector(state),

        error: state.user.error,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        close: bindActionCreators(hideBillingWindow, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(BillingWrapper);