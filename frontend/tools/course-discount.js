import {getMinutesBetween} from "tools/time-tools";

export default class CourseDiscountHandler {
    constructor(data) {
        this.activePersonalDiscount = null
        this._handleDiscount(data)
    }

    _handleDiscount({code, course, user}) {
        // if (!user) return
        if (!user) {user = {Id: 2}}

        if (course.PersonalDiscounts) {
            let _savedDisc = localStorage.getItem(`u${user.Id}_disc`),
                _serverDisc = code && course.PersonalDiscounts[code]

            if (!_savedDisc) {

                if (!_serverDisc) return

                const _persDisc = {}

                let _expDate = new Date()

                _expDate = _expDate.setHours(_expDate.getHours() + +_serverDisc.Hours)

                _persDisc[code] = {
                    perc: _serverDisc.Perc,
                    price: _serverDisc.Price,
                    expireDate: _expDate,
                    lastDate: _serverDisc.LastDate,
                }

                localStorage.setItem(`u${user.Id}_disc`, JSON.stringify(_persDisc))
                if (_serverDisc.Price < course.DPrice) { this.activePersonalDiscount = {code: code, expireDate: _expDate} }
            } else {
                _savedDisc = JSON.parse(_savedDisc)
                let _discounts = this._checkExpireDiscounts(_savedDisc, course.PersonalDiscounts),
                    _disc = _discounts[code]

                if (!_disc && _serverDisc) {
                    let _expDate = new Date
                    _expDate = _expDate.setHours(_expDate.getHours() + +_serverDisc.Hours)

                    _discounts[code] = {
                        perc: _serverDisc.Perc,
                        price: _serverDisc.Price,
                        expireDate: _expDate,
                        lastDate: _serverDisc.LastDate,
                    }
                }

                let _minPrice = course.DPrice,
                    _currentCode = null
                Object.entries(_discounts).forEach(([key, value]) => {
                    if (value.price < _minPrice) {
                        _currentCode = key
                        _minPrice = value.price
                    }
                })

                if (_currentCode) { this.activePersonalDiscount = {code: _currentCode, expireDate: _discounts[_currentCode].expireDate} }

                localStorage.setItem(`u${user.Id}_disc`, JSON.stringify(_discounts))
            }
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
}

export const getExpireTitle = (expireDate) => {
    let _minutes = getMinutesBetween(new Date(expireDate), Date.now())

    if (_minutes > 24 * 60) {

    }
}


