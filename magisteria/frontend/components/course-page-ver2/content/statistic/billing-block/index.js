import React from "react"
import {connect} from "react-redux";
import BuyButton from "../../../../billing/buy-button";
import PriceTitle from "../../../../billing/price-title";
import DiscountTitle from "../../../../billing/discount-title";
import PropTypes from "prop-types";
import {enabledPaidCoursesSelector} from "ducks/app";
import GiftButton from "../../../../billing/gift-button";
import AvailabilityTitle from "../availability-title";

class BillingBlock extends React.Component {

    static propTypes = {
        course: PropTypes.object,
    }

    render() {
        const {course, enabledPaidCourse,} = this.props

        if (!enabledPaidCourse) {
            return null
        }

        if (!(course && (course.IsPaid && !course.IsGift && !course.IsBought))) {
            return null
        }

        let _hasDiscount = course.DPrice && course.Discount && course.Discount.Perc,
            _hasDiscountDescr = _hasDiscount && course.Discount.Description

        return <React.Fragment>
            <div className={"course-module__price-block pay-button" + (!_hasDiscountDescr ? " _no-description" : "")}>
                <div className="course-module__price-block-wrapper button-block">
                    <PriceTitle course={course}/>
                    <DiscountTitle course={course}/>
                    <BuyButton course={course}/>
                </div>
            </div>
            <GiftButton course={course}/>
            <AvailabilityTitle/>
        </React.Fragment>
    }
}

const mapStateToProps = (state) => {
    return {
        enabledPaidCourse: enabledPaidCoursesSelector(state),
    }
}

export default connect(mapStateToProps)(BillingBlock)
