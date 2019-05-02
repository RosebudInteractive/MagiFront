import React from "react";
import {Link} from "react-router-dom"

export const Card = (props) => {
    return <li className="payment-method">
        <input type="radio" className="payment-form__option" name="payment-type" id="card"
               onClick={props.onClick} checked={props.checked}/>
        <label htmlFor="card" className="payment-form__text">
            <span>Банковская карта</span>
            <div className="payment-method__icons">
                <div className="payment-method__icon">
                    <img src="/assets/images/visa.png" width="25" height="25" alt=""/>
                </div>
                <div className="payment-method__icon">
                    <img src="/assets/images/mastercard.png" width="19" height="18" alt=""/>
                </div>
            </div>
        </label>
    </li>
}

export const Yandex = (props) => {
    return <li className="payment-method">
        <input type="radio" className="payment-form__option" name="payment-type" id="yad"
               onClick={props.onClick} checked={props.checked}/>
        <label htmlFor="yad" className="payment-form__text">
            <span>Яндекс Деньги</span>
            <div className="payment-method__icons">
                <div className="payment-method__icon">
                    <img src="/assets/images/yad.png" width="15" height="19" alt=""/>
                </div>
            </div>
        </label>
    </li>
}

export const Sberbank = (props) => {
    return <li className="payment-method">
        <input type="radio" className="payment-form__option" name="payment-type" id="sber"
               onClick={props.onClick} checked={props.checked}/>
        <label htmlFor="sber" className="payment-form__text">
            <span>Сбербанк онлайн</span>
            <div className="payment-method__icons">
                <div className="payment-method__icon">
                    <img src="/assets/images/sber.png" width="18" height="18" alt=""/>
                </div>
            </div>
        </label>
    </li>
}

export const Alfa = (props) => {
    return <li className="payment-method">
        <input type="radio" className="payment-form__option" name="payment-type" id="alfa"
               onClick={props.onClick} checked={props.checked}/>
        <label htmlFor="alfa" className="payment-form__text">
            <span>Альфа-клик</span>
            <div className="payment-method__icons">
                <div className="payment-method__icon">
                    <img src="/assets/images/alfa.png" width="12" height="18" alt=""/>
                </div>
            </div>
        </label>
    </li>
}

export const Qiwi = (props) => {
    return <li className="payment-method">
        <input type="radio" className="payment-form__option" name="payment-type" id="qiwi"
               onClick={props.onClick} checked={props.checked}/>
        <label htmlFor="qiwi" className="payment-form__text">
            <span>QIWI Кошелек</span>
            <div className="payment-method__icons">
                <div className="payment-method__icon">
                    <img src="/assets/images/qiwi.png" width="16" height="16" alt=""/>
                </div>
            </div>
        </label>
    </li>
}

export const WebMoney = (props) => {
    return <li className="payment-method">
        <input type="radio" className="payment-form__option" name="payment-type" id="webmoney"
               onClick={props.onClick} checked={props.checked}/>
        <label htmlFor="webmoney" className="payment-form__text">
            <span>Webmoney</span>
            <div className="payment-method__icons">
                <div className="payment-method__icon">
                    <img src="/assets/images/webmoney.png" width="19" height="18" alt=""/>
                </div>
            </div>
        </label>
    </li>
}

export const Mobile = (props) => {
    return <li className="payment-method">
        <input type="radio" className="payment-form__option" name="payment-type" id="mobile"
               onClick={props.onClick} checked={props.checked}/>
        <label htmlFor="mobile" className="payment-form__text">
            <span>Баланс мобильного телефона</span>
        </label>
    </li>
}

export const AutosubscribeButton = (props) => {
    return props.visible
        ?
        <div className="subscription-form__check">
            <input type="checkbox" id="autosubscribe" className="visually-hidden"
                   checked={props.checked} onChange={props.onChange}/>
            <label htmlFor="autosubscribe" className="subscription-form__label">Запомнить
                реквизиты</label>
        </div>
        :
        null
}

export const OfferMessage = () => {
    return <div className="subscription-form__offer">
        {"Нажимая на кнопку «Оплатить» вы принимаете условия "}
            <Link to={"/doc/oferta.pdf"} target="_blank">договора-оферты</Link>
        </div>
}