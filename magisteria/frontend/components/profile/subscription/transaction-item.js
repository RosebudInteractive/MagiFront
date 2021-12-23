import React from 'react';
import PropTypes from 'prop-types';
import {getHistoryFormatDate} from "../../../tools/time-tools";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {enableRefundSelector} from "ducks/app";
import {refundPayment} from "ducks/billing";
import {getCurrencySign} from "../../../tools/page-tools";

class Item extends React.Component {

    static propTypes = {
        item: PropTypes.object,
    }

    render() {
        let {item} = this.props,
            _currency = getCurrencySign()

        return (
            item
                ?
                <li className="subscription-history__item">
                    <div className="subscription-history__transaction">
                        <span className="subscription-history__name">{this._getName()}</span>
                        <span className="subscription-history__date">{this._getDate()}</span>
                    </div>
                    <p className="subscription-history__total">
                        {item.Sum + _currency}
                        {this._getRefundButton()}
                    </p>
                </li>
                :
                null
        )
    }

    _getName() {
        let {item} = this.props,
            _name = item.Items.length === 1 ? item.Items[0].Name : item.Name;

        return item.InvoiceTypeId === 2 ? _name + '(возврат)' : _name;
    }

    _getDate() {
        let {item} = this.props,
            _date = getHistoryFormatDate(item.InvoiceDate);

        return _date.day + ' ' + _date.time
    }

    _getRefundButton() {
        let {item, enableRefund,} = this.props

        return enableRefund && (item.InvoiceTypeId === 1 && item.RefundSum === 0)
            ?
            <button className="btn btn--rounded refund__btn" onClick={::this._requestRefund}>Возврат</button>
            :
            null
    }

    _requestRefund() {
        let _data = {
            Refund:{
                payment_id: this.props.item.ChequeId
            }
        }
        this.props.refundPayment(_data)
    }
}

function mapStateToProps(state) {
    return {
        enableRefund: enableRefundSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        refundPayment : bindActionCreators(refundPayment, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Item);