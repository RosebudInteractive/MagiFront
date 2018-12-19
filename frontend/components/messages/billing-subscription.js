import React from 'react';
import PropTypes from 'prop-types';
import {
    getSubscriptionTypes,
    switchToPayment,
    setSubscriptionType,
    loadingSelector,
    errorSelector,
    typesSelector,
} from "../../ducks/billing";
import {connect} from "react-redux";
import {bindActionCreators} from 'redux';

class SubscriptionForm extends React.Component {

    constructor(props) {
        super(props)
    }

    static propTypes = {
        onChoose: PropTypes.func,
    };

    componentWillMount() {
        this.props.getSubscriptionTypes()
    }

    componentWillReceiveProps() {

    }

    componentDidMount() {

    }

    _getDescription(data) {
        let _itemsName = (data.units === 'y') ? (
                data.duration === 1 ? 'год' : data.duration < 5 ? 'года' : 'лет'
            )
            : (
                data.duration === 1 ? 'месяц' : 'месяца'
            )

        return <p className="subscription-item__headline">
            Подписка
            <span className="js-duration">
                {' на '}
                <span className="duration">
                    {data.duration}
                </span>
                {' ' + _itemsName + '  '}
            </span>
        </p>
    }

    _getSubscriptionList() {
        return this.props.subscriptionList ?
            this.props.subscriptionList.map((item, index) => {
                let _monthCount = (item.ExtFields.units === 'y') ? item.ExtFields.duration * 12 : item.ExtFields.duration,
                    _price = Math.round(item.Price / _monthCount);

                return <li className="subscription-item" key={index}>
                    {this._getDescription(item.ExtFields)}
                    <p className="subscription-item__descr">При разовой оплате <span
                        className="emph">{item.Price + '₽'}</span></p>
                    <div className="subscription-item__price-block">
                        <div className="subscription-item__price">
                            <span className="amount">{_price}</span>
                            <span className="currency">₽</span>
                            <span className="period">/ месяц</span>
                        </div>
                        <div className="btn btn--rounded subscription-item__btn js-subscribe" onClick={() => {this._setSubscriptionType(item)}}>
                            Оформить
                        </div>
                    </div>
                </li>
            })
            :
            null
    }

    _setSubscriptionType(item) {
        let {billingTest, user} = this.props,
            _disablePayment = billingTest && (!!user && user.PData && (!user.PData.isAdmin) && user.PData.roles.billing_test)
        this.props.setSubscriptionType(item)

        if (!_disablePayment) {
            this.props.switchToPayment()
        }
    }

    render() {
        let {loading, error} = this.props;

        return (
            !(loading && error) ?
                <div className="billing-steps__item js-billing-step active">
                    <div className="modal__header">
                        <p className="modal__headline">Оформить подписку</p>
                        <p className="modal__descr">и получить доступ <span className="emph">ко всем</span> курсам
                            и&nbsp;материалам.</p>
                    </div>
                    <div className="modal__body subscriptions-list">
                        <ul>
                            {this._getSubscriptionList()}
                        </ul>
                    </div>
                </div>
                :
                null
        )
    }
}

function mapStateToProps(state) {
    return {
        loading: loadingSelector(state),
        subscriptionList: typesSelector(state),
        error: errorSelector(state),
        billingTest : state.app.billingTest,
        user: state.user.user,

    }
}

function mapDispatchToProps(dispatch) {
    return {
        getSubscriptionTypes: bindActionCreators(getSubscriptionTypes, dispatch),
        switchToPayment: bindActionCreators(switchToPayment, dispatch),
        setSubscriptionType: bindActionCreators(setSubscriptionType, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SubscriptionForm);

