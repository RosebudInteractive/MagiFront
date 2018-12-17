import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {
    loadingSelector,
    errorSelector,
    selectedTypeSelector,
    sendPayment,
    switchToSubscription,
    isRedirectActiveSelector
} from "../../ducks/billing";

class PaymentForm extends React.Component {

    constructor(props) {
        super(props)
        this.state = {selectedMethod: null};
    }

    _close() {
        this.props.close()
    }

    _handleSubmit(event) {
        event.preventDefault();

        if (this._isSendingEnable()) {
            const data = new FormData(event.target);
            data.Payment = {
                returnUrl: window.location.pathname,
                save_payment_method: true,
                payment_method_data: {
                    type: this.state.selectedMethod
                }
            }
            data.Invoice = {
                UserId: this.props.user.Id,
                InvoiceTypeId: 1,
                Items: [
                    {
                        ProductId: this.props.selectedSubscription.Id,
                        Price: this.props.selectedSubscription.Price,
                    }
                ]
            }

            this.props.sendPayment(data)
        }
    }

    _selectPayment(e) {
        switch (e.target.id) {
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

    _isSendingEnable() {
        return !!this.state.selectedMethod || this.props.loading || this.props.needRedirect
    }

    render() {
        let _disabledBtn = !this._isSendingEnable()
        let {selectedSubscription} = this.props;

        return <div className="billing-steps__item js-billing-step active">
            <div className="modal__header">
                <p className="modal__headline">Оформить подписку <span className="js-subcribe-period">   </span></p>
                <button className="billing-steps__back js-billing-back" type="button"
                        onClick={::this.props.switchToSubscription}>
                    ← Выбрать другой вариант подписки
                </button>
            </div>
            <div className="modal__body payment-methods">
                <h3 className="payment-methods__title">Выберите способ оплаты</h3>
                <form action="#" method="post" className="payment-form">
                    <ul className="payment-methods__list">
                        <li className="payment-method">
                            <input type="radio" className="payment-form__option" name="payment-type" id="card"
                                   onClick={::this._selectPayment}/>
                            <label htmlFor="card" className="payment-form__text">
                                <span>Банковская карта</span>
                                <div className="payment-method__icons">
                                    <div className="payment-method__icon">
                                        <img src="assets/images/visa.png" width="25" height="25" alt=""/>
                                    </div>
                                    <div className="payment-method__icon">
                                        <img src="assets/images/mastercard.png" width="19" height="18" alt=""/>
                                    </div>
                                </div>
                            </label>
                        </li>
                        <li className="payment-method">
                            <input type="radio" className="payment-form__option" name="payment-type" id="yad"
                                   onClick={::this._selectPayment}/>
                            <label htmlFor="yad" className="payment-form__text">
                                <span>Яндекс Деньги</span>
                                <div className="payment-method__icons">
                                    <div className="payment-method__icon">
                                        <img src="assets/images/yad.png" width="15" height="19" alt=""/>
                                    </div>
                                </div>
                            </label>
                        </li>
                        <li className="payment-method">
                            <input type="radio" className="payment-form__option" name="payment-type" id="sber"
                                   onClick={::this._selectPayment}/>
                            <label htmlFor="sber" className="payment-form__text">
                                <span>Сбербанк онлайн</span>
                                <div className="payment-method__icons">
                                    <div className="payment-method__icon">
                                        <img src="assets/images/sber.png" width="18" height="18" alt=""/>
                                    </div>
                                </div>
                            </label>
                        </li>
                        <li className="payment-method">
                            <input type="radio" className="payment-form__option" name="payment-type" id="alfa"
                                   onClick={::this._selectPayment}/>
                            <label htmlFor="alfa" className="payment-form__text">
                                <span>Альфа-клик</span>
                                <div className="payment-method__icons">
                                    <div className="payment-method__icon">
                                        <img src="assets/images/alfa.png" width="12" height="18" alt=""/>
                                    </div>
                                </div>
                            </label>
                        </li>
                        <li className="payment-method">
                            <input type="radio" className="payment-form__option" name="payment-type" id="qiwi"
                                   onClick={::this._selectPayment}/>
                            <label htmlFor="qiwi" className="payment-form__text">
                                <span>QIWI Кошелек</span>
                                <div className="payment-method__icons">
                                    <div className="payment-method__icon">
                                        <img src="assets/images/qiwi.png" width="16" height="16" alt=""/>
                                    </div>
                                </div>
                            </label>
                        </li>
                        <li className="payment-method">
                            <input type="radio" className="payment-form__option" name="payment-type" id="webmoney"
                                   onClick={::this._selectPayment}/>
                            <label htmlFor="webmoney" className="payment-form__text">
                                <span>Webmoney</span>
                                <div className="payment-method__icons">
                                    <div className="payment-method__icon">
                                        <img src="assets/images/webmoney.png" width="19" height="18" alt=""/>
                                    </div>
                                </div>
                            </label>
                        </li>
                        <li className="payment-method">
                            <input type="radio" className="payment-form__option" name="payment-type" id="mobile"
                                   onClick={::this._selectPayment}/>
                            <label htmlFor="mobile" className="payment-form__text">
                                <span>Баланс мобильного телефона</span>
                            </label>
                        </li>
                    </ul>
                    <div className="payment-form__footer js-sticky sticky">
                        <p className="payment-form__label">Всего к оплате:
                            <span className="total">{selectedSubscription.Price}<span className="cur">₽</span></span>
                        </p>
                        <button className={"payment-form__submit btn btn--brown" + (_disabledBtn ? ' disabled' : '')}
                                onClick={::this._handleSubmit}>
                            Оплатить →
                        </button>
                    </div>
                </form>
            </div>
        </div>
    }
}


function mapStateToProps(state) {
    return {
        loading: loadingSelector(state),
        selectedSubscription: selectedTypeSelector(state),
        needRedirect: isRedirectActiveSelector(state),
        error: errorSelector(state),
        user: state.user.user,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        sendPayment: bindActionCreators(sendPayment, dispatch),
        switchToSubscription: bindActionCreators(switchToSubscription, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PaymentForm);