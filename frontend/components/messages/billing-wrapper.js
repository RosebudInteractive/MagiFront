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
    constructor(props) {
        super(props)

        this.state = {
            opened: false
        }
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.showBillingWindow && this.props.showBillingWindow) {
            this._onShow()
        }

        if (prevProps.showBillingWindow && !this.props.showBillingWindow) {
            this._onHide()
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
                null;
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
        let {showBillingWindow} = this.props;

        return showBillingWindow ?
            <div
                className={"modal-overlay modal-wrapper js-modal-wrapper" + (this.state.opened ? ' is-opened' : ' invisible')}>
                <div className="modal _billing billing-steps is-opened" id="billing">
                    <button type="button" className="modal__close js-modal-close" data-target="billing"
                            onClick={::this._onCloseClick}>Закрыть
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
        showBillingWindow: showBillingWindowSelector(state),
        billingStep: billingStepSelector(state),
        loading: loadingSelector(state),
        authorized: !!state.user.user,

        error: state.user.error,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        close: bindActionCreators(hideBillingWindow, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(BillingWrapper);