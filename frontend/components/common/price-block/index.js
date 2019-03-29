import React from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from "redux";
import {showCoursePaymentWindow, setSubscriptionType} from "ducks/billing";
import connect from "react-redux/es/connect/connect";

class PriceBlock extends React.Component {

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
                <div className="btn btn--brown course-module__price-btn" onClick={::this._onClick}>Купить</div>
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

    _onClick() {
        const {course} = this.props;

        this._setSubscriptionType({
            Price: course.DPrice ? course.DPrice : course.Price,
            Id : course.ProductId,
            Title: course.Name,
        })
        this.props.showPaymentWindow()
    }

    _setSubscriptionType(item) {
        let {billingTest, user} = this.props,
            _disablePayment = billingTest && (!!user && user.PData && (!user.PData.isAdmin) && user.PData.roles.billing_test)
        this.props.setSubscriptionType(item)

        // if (!_disablePayment) {
        //     this.props.switchToPayment()
        // }
    }
}

function mapDispatchToProps(dispatch) {
    return {
        showPaymentWindow: bindActionCreators(showCoursePaymentWindow, dispatch),
        setSubscriptionType: bindActionCreators(setSubscriptionType, dispatch),
    }
}

export default connect(null, mapDispatchToProps)(PriceBlock);