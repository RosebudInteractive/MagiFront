import React from 'react';
import PropTypes from 'prop-types';
import {getCurrencySign} from "tools/page-tools";

export default class PriceTitle extends React.Component {

    static propTypes = {
        course: PropTypes.object,
    }

    render() {
        const {course,} = this.props,
            _currency = getCurrencySign()

        let _hasDiscount = course.DPrice && course.Discount && course.Discount.Perc || course.activePersonslDiscount,
            _price = _hasDiscount ?
                course.activePersonslDiscount ?
                    course.PersonalDiscounts[course.activePersonslDiscount.code].Price
                    :
                    course.DPrice
                :
                0,
            _percent = _hasDiscount ?
                course.activePersonslDiscount ?
                    course.PersonalDiscounts[course.activePersonslDiscount.code].Perc
                    :
                    course.Discount.Perc
                :
                0

        return <div className="course-module__price-block-section">
            {
                _hasDiscount ?
                    <React.Fragment>
                        <p className="course-module__price">{_price + _currency + " "}<span className="discount">{`-${_percent}%`}</span></p>
                        <p className="course-module__old-price">{course.Price + _currency}</p>
                    </React.Fragment>
                    :
                    <p className="course-module__price">{course.Price + _currency}</p>
            }
        </div>
    }
}
