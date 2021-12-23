import React from 'react';
import PropTypes from 'prop-types';
import {getCurrencySign} from "tools/page-tools";
import CourseDiscounts from "tools/course-discount";

const REFRESH_INTERVAL = 60 * 1000

export default class PriceTitle extends React.Component {

    static propTypes = {
        course: PropTypes.object,
    }

    componentWillUnmount() {
        clearInterval(this._timer)
    }

    render() {
        const {course,} = this.props,
            _currency = getCurrencySign()

        let {hasDiscount, price, percent, dynamicDiscount} = CourseDiscounts.getActualPriceAndDiscount({course})

        this._toggleDiscountRefreshTimer(dynamicDiscount)

        return <div className="course-module__price-block-section">
            {
                hasDiscount ?
                    <React.Fragment>
                        <p className="course-module__price">{price + _currency + " "}<span className="discount">{`-${percent}%`}</span></p>
                        <p className="course-module__old-price">{course.Price + _currency}</p>
                    </React.Fragment>
                    :
                    <p className="course-module__price">{course.Price + _currency}</p>
            }
        </div>
    }

    _toggleDiscountRefreshTimer(dynamicDiscount) {
        if (dynamicDiscount) {
            if (!this._timer) {
                this._timer = setInterval(() => {this.forceUpdate()}, REFRESH_INTERVAL)
            }
        } else {
            if (this._timer) {
                clearInterval(this._timer)
                this._timer = null
            }
        }
    }
}
