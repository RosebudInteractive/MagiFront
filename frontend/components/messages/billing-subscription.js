import React from 'react';
import PropTypes from 'prop-types';

class SignInForm extends React.Component {

    constructor(props) {
        super(props)
    }

    static propTypes = {
        onChoose: PropTypes.func,
    };

    componentWillReceiveProps(nextProps) {

    }

    componentDidMount() {

    }

    render() {
        const {invalid, serverError, loading} = this.props;
        const _errorText = serverError &&
            <p className="form__error-message js-error-message" style={{display: "block"}}>{serverError}</p>

        return (
            <div className="billing-steps__item js-billing-step active">
                <div className="modal__header">
                    <p className="modal__headline">Оформить подписку</p>
                    <p className="modal__descr">и получить доступ <span className="emph">ко всем</span> курсам
                        и&nbsp;материалам.</p>
                </div>
                <div className="modal__body subscriptions-list">
                    <ul>
                        <li className="subscription-item">
                            <p className="subscription-item__headline">Подписка <span className="js-duration">   </span>
                            </p>
                            <p className="subscription-item__descr">Можно отменить в любой момент.</p>
                            <div className="subscription-item__price-block">
                                <div className="subscription-item__price">
                                    <span className="amount">250</span>
                                    <span className="currency">₽</span>
                                    <span className="period">/ месяц</span>
                                </div>
                                <a href="#"
                                   className="btn btn--rounded subscription-item__btn js-subscribe">Оформить</a>
                            </div>
                        </li>
                        <li className="subscription-item">
                            <p className="subscription-item__headline">Подписка <span className="js-duration">на   <span
                                className="duration">3</span> месяца  </span></p>
                            <p className="subscription-item__descr">При разовой оплате <span
                                className="emph">550₽</span></p>
                            <div className="subscription-item__price-block">
                                <div className="subscription-item__price">
                                    <span className="amount">183</span>
                                    <span className="currency">₽</span>
                                    <span className="period">/ месяц</span>
                                </div>
                                <a href="#"
                                   className="btn btn--rounded subscription-item__btn js-subscribe">Оформить</a>
                            </div>
                        </li>
                        <li className="subscription-item">
                            <p className="subscription-item__headline">Подписка <span className="js-duration">на   <span
                                className="duration">12</span> месяцев  </span></p>
                            <p className="subscription-item__descr">При разовой оплате <span
                                className="emph">1&nbsp;750₽</span></p>
                            <div className="subscription-item__price-block">
                                <div className="subscription-item__price">
                                    <span className="amount">145</span>
                                    <span className="currency">₽</span>
                                    <span className="period">/ месяц</span>
                                </div>
                                <a href="#"
                                   className="btn btn--rounded subscription-item__btn js-subscribe">Оформить</a>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        )
    }
}

export default reduxForm({
    form: 'SignInForm',
    validate
})(SignInForm);