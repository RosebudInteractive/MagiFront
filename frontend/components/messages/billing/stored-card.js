import React from 'react'
import CardBlock from "../../profile/subscription/card-block";
import PropTypes from "prop-types";

export default class StoredCard extends React.Component {

    static propTypes = {
        checked: PropTypes.bool,
        visible: PropTypes.bool,
        onChange: PropTypes.func,
    };

    _onChange(e) {
        if (this.props.onChange) {
            this.props.onChange(e)
        }
    }

    render() {
        let {visible, checked} = this.props;

        return (
            visible ?
                <div className="payment-methods__stored">
                    <div className="payment-methods__stored-col">
                        <input type="radio" className="payment-form__option _single" name="stored" id="stored-card"
                               checked={checked} onChange={::this._onChange}/>
                        <label htmlFor="stored-card" className="payment-form__text">
                            <span>Запомненные реквизиты</span>
                        </label>
                    </div>
                    <div className="payment-methods__stored-col">
                        <CardBlock parent="payment-methods__card-block" showButton={false}/>
                    </div>
                </div>
                :
                null
        )
    }
}