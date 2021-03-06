import React from "react";
import {Link} from "react-router-dom"

const CHECKBOX_TITLE = {
    UNCHECKED: 'Запомнить реквизиты',
    CHECKED: 'Не запоминать реквизиты',
}

export const Card = (props) => {
    return <li className="payment-method">
        <input type="radio" className="payment-form__option" name="payment-type" id="card"
               onClick={props.onClick} checked={props.checked}/>
        <label htmlFor="card" className="payment-form__text">
            <span className="font-universal__body-large">Банковская карта</span>
            <div className="payment-method__icons">
                <div className="payment-method__icon">
                    <img src="/images/visa.png" width="25" height="25" alt=""/>
                </div>
                <div className="payment-method__icon">
                    <img src="/images/mastercard.png" width="19" height="18" alt=""/>
                </div>
            </div>
        </label>
    </li>
}

export const Yandex = (props) => {
    return <li className="payment-method">
        <input type="radio" className="payment-form__option" name="payment-type" id="iomoney"
               onClick={props.onClick} checked={props.checked}/>
        <label htmlFor="iomoney" className="payment-form__text">
            <span className="font-universal__body-large">ЮMoney</span>
            <div className="payment-method__icons">
                <div className="payment-method__icon">
                    <img src="/images/iomoney.png" width={86} height={18} alt="iomoney"/>
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
            <span className="font-universal__body-large">Сбербанк онлайн</span>
            <div className="payment-method__icons">
                <div className="payment-method__icon">
                    <img src="/images/sber.png" width="18" height="18" alt=""/>
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
            <span className="font-universal__body-large">Альфа-клик</span>
            <div className="payment-method__icons">
                <div className="payment-method__icon">
                    <img src="/images/alfa.png" width="12" height="18" alt=""/>
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
            <span className="font-universal__body-large">QIWI Кошелек</span>
            <div className="payment-method__icons">
                <div className="payment-method__icon">
                    <img src="/images/qiwi.png" width="16" height="16" alt=""/>
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
            <span className="font-universal__body-large">Webmoney</span>
            <div className="payment-method__icons">
                <div className="payment-method__icon">
                    <img src="/images/webmoney.png" width="19" height="18" alt=""/>
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
            <span className="font-universal__body-large">Баланс мобильного телефона</span>
        </label>
    </li>
}

export const AutosubscribeButton = (props) => {
    return props.visible
        ?
        <div className="subscription-form__check">
            <input type="checkbox" id="autosubscribe" className="visually-hidden"
                   checked={props.checked} onChange={props.onChange}/>
            <label htmlFor="autosubscribe" className="subscription-form__label">
                {props.checked ? CHECKBOX_TITLE.CHECKED : CHECKBOX_TITLE.UNCHECKED}
            </label>
        </div>
        :
        null
}

export const OfferMessage = (props) => {
    return <div className="font-universal__body-small subscription-form__offer secondary-dark">
        {"Нажимая на кнопку «" + (props.isGift ? "Получить" : "Оплатить") + "» вы принимаете условия "}
        <Link to={"/doc/oferta.pdf"} className="main-dark" target="_blank">договора-оферты</Link>
    </div>
}
