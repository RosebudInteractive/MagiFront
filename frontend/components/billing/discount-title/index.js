import React from 'react';
import PropTypes from 'prop-types';

export default class DiscountTitle extends React.Component {

    static propTypes = {
        course: PropTypes.object,
    }

    render() {
        const {course,} = this.props,
            _hasDiscount = course.DPrice && course.Discount && course.Discount.Perc,
            _hasDiscountDescr = course.activePersonslDiscount
                ?
                "Ваша персональная скидка активна еще "
                :
                _hasDiscount && course.Discount.Description

        return _hasDiscountDescr ?
                <div className="course-module__price-block-wrapper">
                    <p className="course-module__price-block-info">
                        {" " + course.Discount.Description}
                    </p>
                </div>
                :
                null
    }
}
