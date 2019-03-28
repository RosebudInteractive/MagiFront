import React from 'react';
import PropTypes from 'prop-types';


export default class PriceBlock extends React.Component {

    static propTypes = {
        course: PropTypes.object,
    }


    render() {
        const {course} = this.props

        if (!(course && course.IsPaid)) {
            return null
        }

        let _hasDiscount = course.DPrice && course.Discount && course.Discount.Perc,
            _hasDiscountDescr = _hasDiscount && course.Discount.Description;

        return <div className="course-module__price-block">
            <div className="course-module__price-block-wrapper">
                <a href="#" className="btn btn--brown course-module__price-btn">Купить</a>
                <div className="course-module__price-block-section">
                    {
                        _hasDiscount ?
                            <React.Fragment>
                                <p className="course-module__price">{course.DPrice + "₽ "}<span className="discount">{`-${course.Discount.Perc}%`}</span></p>
                                <p className="course-module__old-price">{course.Price + "₽"}</p>
                            </React.Fragment>
                            :
                            <p className="course-module__price">{course.Price + "₽"}</p>
                    }
                </div>
            </div>
            {
                _hasDiscountDescr ?
                    <div className="course-module__price-block-wrapper">
                        <p className="course-module__price-block-info">
                            <span className="label">Персональная скидка.</span>
                            {" " + course.Discount.Description}
                        </p>
                    </div>
                    :
                    null
            }
        </div>
    }
}