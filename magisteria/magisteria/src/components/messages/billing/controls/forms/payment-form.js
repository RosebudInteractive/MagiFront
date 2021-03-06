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
import StoredCard from "../stored-card";
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
} from "../payment-items";
import {loadingSubsInfoSelector, subscriptionInfoSelector, getSubscriptionInfo,} from "ducks/profile";
import {notifyPaymentButtonClicked, notifyPriceButtonClicked} from "ducks/google-analytics";
import WaitingFrame from "../waiting-frame";
import EmailField from "../email-field";
import PromoField from "../promo-field";
import {getCurrencySign} from "tools/page-tools";
import './payment-form.sass'

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

    UNSAFE_componentWillMount() {
        this.props.getSubscriptionInfo()
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if ((!nextProps.loadingSubsInfo) && (this.props.loadingSubsInfo)) {
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
        let _newShowSaveMethodButton = (this.state.selectedMethod === 'bank_card') || (this.state.selectedMethod === 'yoo_money')

        // ???????? ???? ???????????????????? ?????? ????????????, ?? ???????????? ???????????????? true
        // let _newShowSaveMethodButton = false
        if (prevState.showSaveMethodButton !== _newShowSaveMethodButton) {
            this.setState({showSaveMethodButton: _newShowSaveMethodButton})
        }
    }

    componentDidMount() {
        const {selectedSubscription,} = this.props;

        this.props.notifyPriceButtonClicked({
            id: selectedSubscription.CourseId,
            author: selectedSubscription.Author,
            category: selectedSubscription.Category,
            name: selectedSubscription.CourseName,
            price: selectedSubscription.Price,
        })
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
                        GenPromo: !!selectedSubscription.buyAsGift
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
            this.props.notifyPaymentButtonClicked({
                id: selectedSubscription.CourseId,
                author: selectedSubscription.Author,
                category: selectedSubscription.Category,
                name: selectedSubscription.CourseName,
                price: this.props.price,
            })
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
            case 'iomoney': {
                this.setState({selectedMethod: 'yoo_money'})
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
        return !!this.state.selectedMethod && !this.props.loading && !this.props.promoLoading && (this.email && !this.email.state.error)
    }

    render() {
        let _disabledBtn = !this._isSendingEnable()
        let {selectedSubscription, paymentType, user} = this.props;

        if (!selectedSubscription) {
            return null
        }

        const _isFullDiscount = !this.props.price,
            _currency = getCurrencySign(),
            _buyAsGift = selectedSubscription.buyAsGift,
            _title = _buyAsGift ?
                "???????????? ?? ?????????????? ????????"
                :
                _isFullDiscount ? "???????????????? ????????" : "???????????? ????????",
            _name = selectedSubscription.Title && (selectedSubscription.Title.toUpperCase().indexOf("????????:") === 0)
                ?
                selectedSubscription.Title.substr(5).trim()
                :
                selectedSubscription.Title

        return <div className="billing-steps__item js-billing-step active">
            <WaitingFrame visible={this.props.loading} message={"??????????????????, ???????? ???????????????????? " + (_isFullDiscount ? "???????????????? " : "?????????????? ") + "..."}/>
            <div className="modal__header">
                {paymentType === PAYMENT_TYPE.BILLING ?
                    <React.Fragment>
                        <p className="modal__headline">???????????????? ???????????????? <span className="js-subcribe-period">   </span>
                        </p>
                        <button className="billing-steps__back js-billing-back" type="button"
                                onClick={::this.props.switchToSubscription}>
                            ??? ?????????????? ???????????? ?????????????? ????????????????
                        </button>
                    </React.Fragment>
                    :
                    <p className="modal__headline">{`${_title} ??${_name}??`}</p>
                }
            </div>
            <div className="modal__body payment-methods">
                <h3 className="payment-methods__title">???????????????? ???????????? ????????????</h3>
                <form action="#" method="post" className="payment-form">
                    <div className={"payment-methods__wrapper"}>
                        <StoredCard onChange={::this._selectPayment}
                                    checked={this.state.selectedMethod === 'stored-card'}
                                    visible={this.state.showStoredMethod}/>
                        <ul className="payment-methods__list">
                            <Card onClick={::this._selectPayment} checked={this.state.selectedMethod === 'bank_card'}/>
                            <Yandex onClick={::this._selectPayment} checked={this.state.selectedMethod === 'yoo_money'}/>
                            <Sberbank onClick={::this._selectPayment} checked={this.state.selectedMethod === 'sberbank'}/>
                            {/*<Alfa onClick={::this._selectPayment} checked={this.state.selectedMethod === 'alfaban'}/>*/}
                            <Qiwi onClick={::this._selectPayment} checked={this.state.selectedMethod === 'qiwi'}/>
                            <WebMoney onClick={::this._selectPayment} checked={this.state.selectedMethod === 'webmoney'}/>
                            {/*<Mobile onClick={::this._selectPayment}*/}
                            {/*        checked={this.state.selectedMethod === 'mobile_balance'}/>*/}
                        </ul>
                    </div>
                    <div className="payment-form__footer-wrapper">
                        <div className="fields-editors__block">
                            { _buyAsGift && <div className="font-universal__title-small">?????????????? e-mail ?????? ?????????????????? ?????????????????????? ?????????????????? ?? ?????????????????????? ????????</div> }
                            <EmailField ref={(input) => { this.email = input; }} defaultValue={user.Email} onChange={() => {this.forceUpdate()}} promoEnable={_buyAsGift}/>
                            {!_buyAsGift && <PromoField ref={(input) => { this.promo = input; }} defaultValue={""} onChange={() => {this.forceUpdate()}}/> }
                        </div>
                        <div className="payment-form__footer subscription-form js-sticky sticky">
                            <AutosubscribeButton
                                visible={this.state.showSaveMethodButton}
                                checked={this.state.savePayment}
                                onChange={::this._changeSavePayment}/>
                            <OfferMessage isGift={_isFullDiscount}/>
                            <button className={"payment-form__submit btn btn--brown" + (_disabledBtn ? ' disabled' : '')}
                                    onClick={::this._handleSubmit}>
                                {_isFullDiscount ? "????????????????" : "????????????????"}
                                {
                                    !_isFullDiscount ?
                                        <span className="total">{this.props.price}<span className="cur">{_currency}</span></span>
                                        :
                                        null
                                }
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
        loading: billingFetching(state),
        promoLoading: promoFetching(state),
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
        notifyPaymentButtonClicked: bindActionCreators(notifyPaymentButtonClicked, dispatch),
        notifyPriceButtonClicked: bindActionCreators(notifyPriceButtonClicked, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PaymentForm);
