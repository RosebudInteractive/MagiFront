import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {
    loadingSelector as billingFetching,
    promoFetchingSelector as promoFetching,
    errorSelector,
    selectedTypeSelector,
    priceSelector,
    sendPayment,
    switchToSubscription,
} from "ducks/billing";
import StoredCard from "./stored-card";
import {
    Alfa,
    AutosubscribeButton,
    Card,
    Mobile,
    OfferMessage,
    Qiwi,
    Sberbank,
    WebMoney,
    Yandex,
} from "./payment-items";
import {loadingSubsInfoSelector, subscriptionInfoSelector, getSubscriptionInfo,} from "ducks/profile";
import WaitingFrame from "./waiting-frame";
import EmailField from "./email-field";
import PromoField from "./promo-field";
import {getCurrencySign} from "../../../tools/page-tools";

export const PAYMENT_TYPE = {
    BILLING: 'BILLING',
    COURSE: 'COURSE',
}

class PaymentForm extends React.Component {

    static propTypes = {
        paymentType : PropTypes.string,
    }

    static defaultProps = {
        paymentType: PAYMENT_TYPE.BILLING,
        returnUrl: null,
    }

    constructor(props) {
        super(props)
        this.state = {
            selectedMethod: null,
            showStoredMethod: false,
            showSaveMethodButton: false,
            savePayment: false,
        };
    }

    componentWillMount() {
        this.props.getSubscriptionInfo()
    }

    componentWillReceiveProps(nextProps) {
        if ((!nextProps.loadingSubsInfo) && (!this.props.loadingSubsInfo)) {
            if (nextProps.info && nextProps.info.get('Payment')) {
                this.setState({
                    selectedMethod: 'stored-card',
                    showStoredMethod: true
                })
            } else {
                this.setState({
                    selectedMethod: 'bank_card',
                    showStoredMethod: false,
                })
            }
        }
    }

    componentDidUpdate(prevProps, prevState) {
        let _newShowSaveMethodButton = (this.state.selectedMethod === 'bank_card') || (this.state.selectedMethod === 'yandex_money')

        // Пока не показываем эту кнопку, а всегда передаем true
        // let _newShowSaveMethodButton = false
        if (prevState.showSaveMethodButton !== _newShowSaveMethodButton) {
            this.setState({showSaveMethodButton: _newShowSaveMethodButton})
        }
    }

    _close() {
        this.props.close()
    }

    _handleSubmit(event) {
        event.preventDefault();

        let {selectedMethod, showSaveMethodButton, savePayment} = this.state;
        const {selectedSubscription,} = this.props;

        if (this._isSendingEnable()) {
            // const data = new FormData(event.target);
            const data = new FormData();
            if (selectedMethod === 'stored-card') {
                data.Payment = {
                    cheque_id: this.props.info.get('SubsAutoPayId'),
                    email: this.email.state.value,
                    returnUrl: selectedSubscription.ReturnUrl ? selectedSubscription.ReturnUrl : window.location.pathname,
                }
            } else {
                data.Payment = {
                    returnUrl: selectedSubscription.ReturnUrl ? selectedSubscription.ReturnUrl : window.location.pathname,
                    save_payment_method: showSaveMethodButton ? savePayment : false,
                    payment_method_data: {
                        type: this.state.selectedMethod
                    },
                    email: this.email.state.value,
                }
            }

            data.Invoice = {
                UserId: this.props.user.Id,
                InvoiceTypeId: 1,
                Items: [
                    {
                        ProductId: this.props.selectedSubscription.Id,
                        Price: this.props.price,
                    }
                ]
            }

            if (selectedSubscription.CourseId) {
                data.courseId = selectedSubscription.CourseId
            }

            if (selectedSubscription.Promo) {
                data.Promo = Object.assign({}, selectedSubscription.Promo)
            }

            this.props.sendPayment(data)
        }
    }

    _selectPayment(e) {
        switch (e.target.id) {
            case 'stored-card': {
                this.setState({selectedMethod: 'stored-card'})
                break
            }
            case 'card': {
                this.setState({selectedMethod: 'bank_card'})
                break
            }
            case 'yad': {
                this.setState({selectedMethod: 'yandex_money'})
                break
            }
            case 'sber': {
                this.setState({selectedMethod: 'sberbank'})
                break
            }
            case 'alfa': {
                this.setState({selectedMethod: 'alfaban'})
                break
            }
            case 'qiwi': {
                this.setState({selectedMethod: 'qiwi'})
                break
            }
            case 'webmoney': {
                this.setState({selectedMethod: 'webmoney'})
                break
            }
            case 'mobile': {
                this.setState({selectedMethod: 'mobile_balance'})
                break
            }

        }
    }

    _changeSavePayment() {
        this.setState({
            savePayment: !this.state.savePayment
        })
    }

    _isSendingEnable() {
        return !!this.state.selectedMethod && !this.props.loading && (this.email && !this.email.state.error)
    }

    render() {
        let _disabledBtn = !this._isSendingEnable()
        let {selectedSubscription, paymentType, user} = this.props;
        let _currency = getCurrencySign()

        if (!selectedSubscription) {
            return null
        }

        return <div className="billing-steps__item js-billing-step active">
            <WaitingFrame visible={this.props.loading} message={"Подождите, идет подготовка платежа..."}/>
            <div className="modal__header">
                {paymentType === PAYMENT_TYPE.BILLING ?
                    <React.Fragment>
                        <p className="modal__headline">Оформить подписку <span className="js-subcribe-period">   </span>
                        </p>
                        <button className="billing-steps__back js-billing-back" type="button"
                                onClick={::this.props.switchToSubscription}>
                            ← Выбрать другой вариант подписки
                        </button>
                    </React.Fragment>
                    :
                    <p className="modal__headline">{"Купить «" + selectedSubscription.Title + "»"}</p>
                }
            </div>
            <div className="modal__body payment-methods">
                <h3 className="payment-methods__title">Выберите способ оплаты</h3>
                <form action="#" method="post" className="payment-form">
                    <div className={"payment-methods__wrapper"}>
                        <StoredCard onChange={::this._selectPayment}
                                    checked={this.state.selectedMethod === 'stored-card'}
                                    visible={this.state.showStoredMethod}/>
                        <ul className="payment-methods__list">
                            <Card onClick={::this._selectPayment} checked={this.state.selectedMethod === 'bank_card'}/>
                            <Yandex onClick={::this._selectPayment} checked={this.state.selectedMethod === 'yandex_money'}/>
                            <Sberbank onClick={::this._selectPayment} checked={this.state.selectedMethod === 'sberbank'}/>
                            {/*<Alfa onClick={::this._selectPayment} checked={this.state.selectedMethod === 'alfaban'}/>*/}
                            <Qiwi onClick={::this._selectPayment} checked={this.state.selectedMethod === 'qiwi'}/>
                            <WebMoney onClick={::this._selectPayment} checked={this.state.selectedMethod === 'webmoney'}/>
                            {/*<Mobile onClick={::this._selectPayment}*/}
                            {/*        checked={this.state.selectedMethod === 'mobile_balance'}/>*/}
                        </ul>
                    </div>
                    <div className="payment-form__footer-wrapper">
                        <EmailField ref={(input) => { this.email = input; }} defaultValue={user.Email} onChange={() => {this.forceUpdate()}}/>
                        <PromoField ref={(input) => { this.promo = input; }} defaultValue={""} onChange={() => {this.forceUpdate()}}/>
                        <div className="payment-form__footer subscription-form js-sticky sticky">
                            <AutosubscribeButton
                                visible={this.state.showSaveMethodButton}
                                checked={this.state.savePayment}
                                onChange={::this._changeSavePayment}/>
                            <OfferMessage/>
                            <button className={"payment-form__submit btn btn--brown" + (_disabledBtn ? ' disabled' : '')}
                                    onClick={::this._handleSubmit}>
                                Оплатить
                                <span className="total">{this.props.price}<span className="cur">{_currency}</span></span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    }
}

function mapStateToProps(state) {
    return {
        price: priceSelector(state),
        loadingSubsInfo: loadingSubsInfoSelector(state),
        info: subscriptionInfoSelector(state),
        loading: billingFetching(state) || promoFetching(state),
        selectedSubscription: selectedTypeSelector(state),
        error: errorSelector(state),
        user: state.user.user,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        sendPayment: bindActionCreators(sendPayment, dispatch),
        switchToSubscription: bindActionCreators(switchToSubscription, dispatch),
        getSubscriptionInfo: bindActionCreators(getSubscriptionInfo, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PaymentForm);