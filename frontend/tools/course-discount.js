import {getMinutesBetween} from "tools/time-tools";
import {getCountDaysTitle, getCounterTitle, getCountHoursTitle,} from "tools/word-tools";
import moment from "moment";
import {store} from "../store/configureStore"
import {showDynamicDiscountPopup} from "ducks/message";

const KEY = "mag_dyn_disc"

let _instance = null,
    discountCode = null

export default class CourseDiscounts {

    static getInstance() {
        if (!_instance) {
            _instance = new CourseDiscounts()
        }

        return _instance
    }

    constructor() {
        this.loadFromStorage()
    }

    static getActualPriceAndDiscount({course, buyAsGift}) {
        if (!buyAsGift && !(course && (course.IsPaid && !course.IsGift && !course.IsBought))) {
            return {
                hasDiscount: false,
                price: 0,
                percent: 0,
                dynamicDiscount: false,
                code: null,
                expireDate: null
            }
        }

        let _dynamicDiscount = this.getActiveDynamicDiscount({course: course})
        if (_dynamicDiscount) {
            const _percent = _dynamicDiscount.percent,
                _actualPrice = Math.trunc((course.Price * (1 - _percent / 100))/ 10) * 10

            return {
                hasDiscount: true,
                price: _actualPrice,
                percent: _percent,
                dynamicDiscount: true,
                code: _dynamicDiscount.code,
                promoSum: course.Price - _actualPrice,
                expireDate: _dynamicDiscount.expireDate
            }
        } else {
            let _hasDiscount = course.DPrice && course.Discount && course.Discount.Perc
            return {
                hasDiscount: _hasDiscount,
                price: _hasDiscount ? course.DPrice : course.Price,
                percent: _hasDiscount ? course.Discount.Perc : 0,
                dynamicDiscount: false,
                code: null,
                expireDate: null
            }
        }

    }

    static checkDynamicDiscountInURL(params) {
        const _dynamicDiscount = params.get('dnds') ? params.get('dnds') : null

        if (_dynamicDiscount) {
            discountCode = _dynamicDiscount
            params.delete('dnds')
            return true
        }
    }


    loadFromStorage() {
        let _discountsInStorage = localStorage.getItem(KEY)

        if (!_discountsInStorage) {
            this.localDiscounts = {}
        } else {
            _discountsInStorage = JSON.parse(_discountsInStorage)
            this.localDiscounts = this._checkExpireDiscounts(_discountsInStorage,)

            localStorage.setItem(KEY, JSON.stringify(this.localDiscounts))
        }
    }

    static getActiveDynamicDiscount(data) {
        return this.getInstance()._getDiscount(data)
    }

    _getDiscount({course}) {
        if (!this.localDiscounts || !Object.keys(this.localDiscounts).length) return null

        let _courseDiscounts = this.localDiscounts[course.Id]

        return _courseDiscounts ? this._findActiveDiscount({course: course, discounts: _courseDiscounts}) : null
    }

    static activateDiscount(data) {
        return this.getInstance().addDiscount(data)
    }

    addDiscount({course,}) {
        if (discountCode && course.DynDiscounts) {
            let _serverDiscount = course.DynDiscounts[discountCode]

            if (!_serverDiscount) return

            try {
                let _inDateRange = moment.utc(_serverDiscount.FirstDate).isBefore() &&
                    moment.utc(_serverDiscount.LastDate).isAfter() &&
                    moment.utc().add(+_serverDiscount.TtlMinutes, "m").isBefore(moment.utc(_serverDiscount.LastDate))

                if (!_inDateRange) return

                let _courseDiscounts = this.localDiscounts[course.Id],
                    _discount = _courseDiscounts ? _courseDiscounts[discountCode] : null

                if (_discount) return

                let _activeDiscount = this._findActiveDiscount({course: course, discounts: _courseDiscounts}),
                    _price = _activeDiscount ? _courseDiscounts[_activeDiscount.code].price : course.DPrice

                if (_serverDiscount.DPrice < _price) {
                    let _exprDate = moment.utc().add(+_serverDiscount.TtlMinutes, "m"),
                        _currentExprDate = _activeDiscount ? moment.utc(_activeDiscount.expireDate) : null

                    _exprDate = (_currentExprDate && _currentExprDate.isAfter(_exprDate)) ? _currentExprDate : _exprDate

                    if (!_courseDiscounts) {
                        this.localDiscounts[course.Id] = {}
                        _courseDiscounts = this.localDiscounts[course.Id]
                    }

                    _courseDiscounts[discountCode] = {
                        perc: +_serverDiscount.Perc,
                        price: +_serverDiscount.DPrice,
                        expireDate: _exprDate,
                        firstDate: _serverDiscount.FirstDate,
                        lastDate: _serverDiscount.LastDate,
                    }

                    localStorage.setItem(KEY, JSON.stringify(this.localDiscounts))
                    setTimeout(() => { store.dispatch(showDynamicDiscountPopup(course)) }, 0)
                }
            } finally {
                discountCode = null
            }
        }
    }

    _checkExpireDiscounts(savedDiscounts,) {
        const _result = {}

        Object.entries(savedDiscounts).forEach(([courseId, discounts]) => {
            let _discounts = {}

            Object.entries(discounts).forEach(([code, data]) => {
                if (moment.utc(data.lastDate).isAfter() || moment.utc(data.expireDate).isAfter()) {
                    _discounts[code] = data
                }
            })

            if (Object.entries(_discounts).length) {
                _result[courseId] = _discounts
            }
        })

        return _result
    }

    _findActiveDiscount({course, discounts}) {
        let _minPrice = course.DPrice,
            _currentCode = null

        if (!discounts) return null

        Object.entries(discounts).forEach(([key, value]) => {
            if ((value.price < _minPrice) && moment.utc(value.expireDate).isAfter())  {
                _currentCode = key
                _minPrice = value.price
            }
        })

        return _currentCode ? {code: _currentCode, expireDate: discounts[_currentCode].expireDate, percent: discounts[_currentCode].perc} : null
    }
}

export const getExpireTitle = (expireDate) => {
    let _minutes = getMinutesBetween(Date.now(), new Date(expireDate))

    if (_minutes >= 48 * 60) {
        let _days = Math.trunc(_minutes / (24 * 60))
        return _days + " " + getCountDaysTitle(_days)
    } else if (_minutes >= 60) {
        let _hours = Math.trunc(_minutes / 60)
        return _hours + " " + getCountHoursTitle(_hours)
    } else {
        return _minutes ? _minutes + " " + _getCountMinutesTitle(_minutes) : "менее 1 минуты"
    }
}

const _getCountMinutesTitle = (count) => {
    return getCounterTitle(count, {single: 'минуту', twice: 'минуты', many: 'минут'})
}


