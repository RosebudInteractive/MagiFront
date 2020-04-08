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

        let _hasDiscount = course.DPrice && course.Discount && course.Discount.Perc

        return <div className="course-module__price-block-section">
            {
                _hasDiscount ?
                    <React.Fragment>
                        <p className="course-module__price">{course.DPrice + _currency + " "}<span className="discount">{`-${course.Discount.Perc}%`}</span></p>
                        <p className="course-module__old-price">{course.Price + _currency}</p>
                    </React.Fragment>
                    :
                    <p className="course-module__price">{course.Price + _currency}</p>
            }
        </div>
    }
}
