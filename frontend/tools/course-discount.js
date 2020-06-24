import {getMinutesBetween} from "tools/time-tools";
import {getCountDaysTitle, getCountHoursTitle, getCountMinutesTitle} from "tools/word-tools";

export default class CourseDiscountHandler {
    constructor(data) {
        this.activePersonalDiscount = null
        this._handleDiscount(data)
    }

    _handleDiscount({code, course, user}) {
        // if (!user) return
        if (!user) {user = {Id: 2}}

        if (course.DynDiscounts) {
            let _discountsInStorage = localStorage.getItem(`u${user.Id}_disc`),
                _serverDiscount = code && course.DynDiscounts[code],
                _discounts

            if (!_discountsInStorage) {
                _discounts = {}
            } else {
                _discountsInStorage = JSON.parse(_discountsInStorage)
                _discounts = this._checkExpireDiscounts(_discountsInStorage, course.DynDiscounts)
            }

            this._addDiscount({discounts: _discounts, code: code, serverItem: _serverDiscount})
            localStorage.setItem(`u${user.Id}_disc`, JSON.stringify(_discounts))

            this._findActiveDiscount({course: course, discounts: _discounts})
        }
    }

    _checkExpireDiscounts(savedDiscounts, courseDiscounts) {
        const _result = {}

        Object.entries(savedDiscounts).forEach(([key, value]) => {
            if ((new Date(value.expireDate) >= Date.now()) && courseDiscounts[key]) {
                _result[key] = value
            }
        })

        return _result
    }

    _addDiscount({discounts, code, serverItem}) {
        if (!(code && serverItem)) { return }

        let _expDate = new Date()

        _expDate = _expDate.setHours(_expDate.getHours() + +serverItem.TtlHours)

        discounts[code] = {
            perc: serverItem.Perc,
            price: serverItem.DPrice,
            expireDate: _expDate,
            firstDate: serverItem.FirstDate,
            lastDate: serverItem.LastDate,
        }
    }

    _findActiveDiscount({course, discounts}) {
        let _minPrice = course.DPrice,
            _currentCode = null

        Object.entries(discounts).forEach(([key, value]) => {
            if (value.price < _minPrice) {
                _currentCode = key
                _minPrice = value.price
            }
        })

        if (_currentCode) { this.activePersonalDiscount = {code: _currentCode, expireDate: discounts[_currentCode].expireDate} }
    }
}

export const getExpireTitle = (expireDate) => {
    let _minutes = getMinutesBetween(Date.now(), new Date(expireDate))

    if (_minutes > 24 * 60) {
        let _days = Math.round(_minutes / (24 * 60))
        return _days + " " + getCountDaysTitle(_days)
    } else if (_minutes > 60) {
        let _hours = Math.round(_minutes / 60)
        return _hours + " " + getCountHoursTitle(_hours)
    } else {
        return _minutes + " " + getCountMinutesTitle(_minutes)
    }
}


