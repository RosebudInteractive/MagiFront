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

        let _hasDiscount = course.DPrice && course.Discount && course.Discount.Perc || course.activePersonalDiscount,
            _price = _hasDiscount ?
                course.activePersonalDiscount ?
                    course.DynDiscounts[course.activePersonalDiscount.code].DPrice
                    :
                    course.DPrice
                :
                0,
            _percent = _hasDiscount ?
                course.activePersonalDiscount ?
                    course.DynDiscounts[course.activePersonalDiscount.code].Perc
                    :
                    course.Discount.Perc
                :
                0

        return <div className="course-module__price-block-section">
            {
                _hasDiscount ?
                    <React.Fragment>
                        <p className="course-module__old-price font-special__price-large">{course.Price + _currency}</p>
                        <p className="course-module__price font-special__price-large">{_price + _currency + " "}<span className="discount">{`-${_percent}%`}</span></p>
                    </React.Fragment>
                    :
                    <p className="course-module__price font-special__price-large">{course.Price + _currency}</p>
            }
        </div>
    }
}
