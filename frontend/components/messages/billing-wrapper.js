import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {
    showBillingWindowSelector,
    billingStepSelector,
    loadingSelector,
    BillingStep,
} from "../../ducks/billing";

import Subscription from './billing-subscription'
import Payment from './billing-payments'

class AuthWrapper extends React.Component {

    componentDidUpdate(prevProps) {
        if (!prevProps.showBillingWindow && this.props.showBillingWindow) {
            this._onShow()
        }

        if (prevProps.showBillingWindow && !this.props.showBillingWindow) {
            this._onHide()
        }
    }

    _onShow() {

    }

    _onHide() {

    }

    _getStep() {
        let {billingStep : step, loading, error, userActions} = this.props;

        return (step === BillingStep.subscription) && <Subscription loading={loading} onSubmit={::userActions.login} serverError={error} onStartRecovery={::userActions.switchToRecoveryPassword}/> ||
            (step === BillingStep.payment) && <Payment loading={loading} onSubmit={::userActions.signUp} serverError={error}/> ||
            null
    }

    render() {
        let {showBillingWindow} = this.props;

        return showBillingWindow ?
            <div className="modal _billing billing-steps is-opened" id="billing">
                <button type="button" className="modal__close js-modal-close" data-target="billing">Закрыть</button>
                {this._getStep()}
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
        userActions: bindActionCreators(userActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AuthWrapper);