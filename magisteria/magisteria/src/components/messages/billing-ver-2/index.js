import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import Platform from 'platform';

import {
    showCoursePaymentWindowSelector,
    billingStepSelector,
    loadingSelector as billingFetching,
    hideCoursePaymentWindow,
    redirectComplete,
} from "ducks/billing";

import Payment, {PAYMENT_TYPE} from './billing-form'
import $ from "jquery";
import {enabledPaidCoursesSelector} from "ducks/app";

import "./billing-ver-2.sass"

class CoursePaymentWrapper extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            opened: false,
            isIE: Platform.name === 'IE',
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
        let {showWindow, enabledPaidCourses, showSignInForm, fetching} = this.props;

        const _className = "modal-overlay modal-wrapper js-modal-wrapper" +
            (this.state.isIE ? ' ms-based' : '') +
            (this.state.opened ? ' is-opened' : ' invisible')

        return (showWindow && enabledPaidCourses && !showSignInForm) ?
            <div className={_className}>
                <div className="modal _billing billing-ver-2 is-opened" id="billing">
                    <div>
                    {/*    <div>*/}
                            <button type="button" className="modal__close js-modal-close" data-target="billing"
                                    onClick={::this._onCloseClick} disabled={fetching}>??????????????
                            </button>
                            <Payment paymentType={PAYMENT_TYPE.COURSE}/>
                        {/*</div>*/}
                    </div>
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
        fetching: billingFetching(state),
        // needRedirect: isRedirectActiveSelector(state),
        // redirectUrl: isRedirectUrlSelector(state),
        authorized: !!state.user.user,
        enabledPaidCourses: enabledPaidCoursesSelector(state),

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