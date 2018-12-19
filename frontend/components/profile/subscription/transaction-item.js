import React from 'react';
import PropTypes from 'prop-types';
import {getHistoryFormatDate} from "../../../tools/time-tools";

export default class Item extends React.Component {

    static propTypes = {
        item: PropTypes.object,
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

    render() {
        let {item} = this.props;

        return (
            <li className="subscription-history__item">
                <p className="subscription-history__transaction">{this._getName()}<span
                    className="subscription-history__date">{this._getDate()}</span></p>
                <p className="subscription-history__total">{item.Sum + '₽'}</p>
            </li>
        )
    }
}