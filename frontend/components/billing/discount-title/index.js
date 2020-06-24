import React from 'react';
import PropTypes from 'prop-types';
import {getExpireTitle} from "tools/course-discount";

export default class DiscountTitle extends React.Component {

    static propTypes = {
        course: PropTypes.object,
    }

    render() {
        const {course,} = this.props,
            _hasDiscount = course.DPrice && course.Discount && course.Discount.Perc,
            _description = course.activePersonalDiscount
                ?
                <p className="course-module__price-block-info font-universal__body-large _main-dark">
                    {"Ваша персональная скидка активна еще "}
                    <span className="price-block-info_expire-date font-universal__body-large _red _bold">
                        {getExpireTitle(course.activePersonalDiscount.expireDate)}
                    </span>
                </p>
                :
                _hasDiscount &&
                <p className="course-module__price-block-info font-universal__body-large _main-dark">
                    {" " + course.Discount.Description}
                </p>,
            _hasDiscountDescr = !!_description

        return _hasDiscountDescr ?
                <div className="course-module__price-block-wrapper">
                    {_description}
                </div>
                :
                null
    }
}
