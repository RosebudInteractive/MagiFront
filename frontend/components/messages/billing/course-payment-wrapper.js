import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {
    showCoursePaymentWindowSelector,
    billingStepSelector,
    loadingSelector,
    isRedirectActiveSelector,
    hideCoursePaymentWindow,
    redirectComplete,
    isRedirectUrlSelector
} from "../../../ducks/billing";

import Payment, {PAYMENT_TYPE} from './billing-payments'
import $ from "jquery";
import {enabledSubscriptionSelector} from "ducks/app";

class CoursePaymentWrapper extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            opened: false,
        }
    }

    componentWillReceiveProps(nextProps) {
        if ((nextProps.needRedirect) && (!this.props.needRedirect)) {

            this.props.complete();
            window.location = nextProps.redirectUrl;
        }
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.showWindow && this.props.showWindow) {
            this._onShow()
        }

        if (prevProps.showWindow && !this.props.showWindow) {
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

    _onCloseClick() {
        this.setState({
            opened: false
        })

        setTimeout(() => {
            this.props.close()
        }, 300)

    }

    render() {
        let {showWindow, enabledBilling, showSignInForm, loading} = this.props;

        return (showWindow && enabledBilling && !showSignInForm) ?
            <div
                className={"modal-overlay modal-wrapper js-modal-wrapper" + (this.state.opened ? ' is-opened' : ' invisible')}>
                <div className="modal _billing billing-steps is-opened" id="billing">
                    <button type="button" className="modal__close js-modal-close" data-target="billing"
                            onClick={::this._onCloseClick}>Закрыть
                    </button>
                    <Payment loading={loading} paymentType={PAYMENT_TYPE.COURSE}/>
                </div>
            </div>
            :
            null
    }
}

function mapStateToProps(state) {
    return {
        showSignInForm: state.app.showSignInForm,
        showWindow: showCoursePaymentWindowSelector(state),
        billingStep: billingStepSelector(state),
        loading: loadingSelector(state),
        needRedirect: isRedirectActiveSelector(state),
        redirectUrl: isRedirectUrlSelector(state),
        authorized: !!state.user.user,
        enabledBilling: enabledSubscriptionSelector(state),

        error: state.user.error,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        close: bindActionCreators(hideCoursePaymentWindow, dispatch),
        complete: bindActionCreators(redirectComplete, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CoursePaymentWrapper);