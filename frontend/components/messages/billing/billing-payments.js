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
} from "../../../ducks/billing";
import StoredCard from "./stored-card";
import {Alfa, AutosubscribeButton, Card, Mobile, Qiwi, Sberbank, WebMoney, Yandex,} from "./payment-items";
import {loadingSubsInfoSelector, subscriptionInfoSelector, getSubscriptionInfo} from "../../../ducks/profile";

class PaymentForm extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            selectedMethod: null,
            showStoredMethod: false,
            showSaveMethodButton: false,
            savePayment: true,
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
        if (prevState.showSaveMethodButton !== _newShowSaveMethodButton) {
            this.setState({showSaveMethodButton: _newShowSaveMethodButton})
        }
    }

    _close() {
        this.props.close()
    }

    _handleSubmit(event) {
        event.preventDefault();

        let {selectedMethod, showSaveMethodButton, savePayment,} = this.state;

        if (this._isSendingEnable()) {
            const data = new FormData(event.target);
            if (selectedMethod === 'stored-card') {
                data.Payment = {
                    cheque_id: this.props.info.get('SubsAutoPayId')
                }
            } else {
                data.Payment = {
                    returnUrl: window.location.pathname,
                    save_payment_method: showSaveMethodButton ? savePayment : false,
                    payment_method_data: {
                        type: this.state.selectedMethod
                    }
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
                    <StoredCard checked={this.state.selectedMethod === 'stored-card'}
                                visible={this.state.showStoredMethod}/>
                    <ul className="payment-methods__list">
                        <Card onClick={::this._selectPayment} checked={this.state.selectedMethod === 'bank_card'}/>
                        <Yandex onClick={::this._selectPayment} checked={this.state.selectedMethod === 'yandex_money'}/>
                        <Sberbank onClick={::this._selectPayment} checked={this.state.selectedMethod === 'sberbank'}/>
                        <Alfa onClick={::this._selectPayment} checked={this.state.selectedMethod === 'alfaban'}/>
                        <Qiwi onClick={::this._selectPayment} checked={this.state.selectedMethod === 'qiwi'}/>
                        <WebMoney onClick={::this._selectPayment} checked={this.state.selectedMethod === 'webmoney'}/>
                        <Mobile onClick={::this._selectPayment}
                                checked={this.state.selectedMethod === 'mobile_balance'}/>
                    </ul>
                    <div className="payment-form__footer subscription-form js-sticky sticky">
                        <AutosubscribeButton
                            visible={this.state.showSaveMethodButton}
                            checked={this.state.savePayment}
                            onChange={::this._changeSavePayment}/>
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
        loadingSubsInfo: loadingSubsInfoSelector(state),
        info: subscriptionInfoSelector(state),
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
        getSubscriptionInfo: bindActionCreators(getSubscriptionInfo, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PaymentForm);