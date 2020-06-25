import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {isMobile} from "../../../tools/page-tools";
import PriceButton from "./price-button";
import './mobile-button.sass'
import $ from "jquery";
import GiftButton from "../../billing/gift-button";
import CourseDiscounts, {getExpireTitle} from "tools/course-discount";

const INTERVAL = 60 * 1000

class MobileButton extends React.Component {

    static propTypes = {
        course: PropTypes.object,
    }

    constructor(props) {
        super(props)

        this._resizeHandler = () => {
            this.forceUpdate()
        }

        $(window).on('resize', ::this._resizeHandler)
    }

    componentDidMount() {
        const {course,} = this.props

        if (course.activePersonalDiscount) {
            this._timer = setInterval(() => {
                    let _discount = CourseDiscounts.getActiveDynamicDiscount({course: course})

                    course.activePersonalDiscount = _discount
                    this.forceUpdate()
                    if (!_discount) clearInterval(this._timer)
                },
                INTERVAL)
        }
    }

    componentWillUnmount() {
        $(window).unbind('resize', this._resizeHandler);
        clearInterval(this._timer)
    }

    render() {
        const {course, cookiesConfirmed} = this.props

        if (!course || !isMobile()) {
            return null
        }

        const _style = cookiesConfirmed ? null : {marginBottom : this._getMarginBottom()}

        const _showPriceButton = course.IsPaid && !course.IsGift && !course.IsBought

        return _showPriceButton &&
            <div className="mobile-buttons__block" style={_style}>
                <div className="mobile-buttons__container">
                    <div className="mobile-button_wrapper price-button__wrapper">
                        <PriceButton course={course}/>
                        <div className="mobile-button_background"/>
                    </div>
                    <div className="mobile-button_wrapper gift-button__wrapper">
                        <GiftButton course={course}/>
                        <div className="mobile-button_background"/>
                    </div>
                </div>
                <DiscountTitle course={course}/>
            </div>
    }

    _getMarginBottom() {
        let _message = $('.js-cookies-popup')

        return (_message && _message.length) ? _message.height() + 8 : 6
    }
}

const DiscountTitle = (props) => {
    const {course} = props,
        _hasDiscount = course.DPrice && course.Discount && course.Discount.Perc,
        _description = course.activePersonalDiscount
            ?
            <div className="discount-title__text font-universal__body-medium _main-dark">
                {"Ваша персональная "}
                <span className="discount-title__text font-universal__body-medium _red _bold">
                    {course.DynDiscounts[course.activePersonalDiscount.code].Perc + "%"}
                </span>
                {" скидка активна еще "}
                <span className="discount-title__text font-universal__body-medium _red _bold">
                    {getExpireTitle(course.activePersonalDiscount.expireDate)}
                </span>
            </div>
            :
            _hasDiscount &&
            <div className="discount-title__text font-universal__body-medium _main-dark">
                {" " + course.Discount.Description}
            </div>,
        _hasDiscountDescr = !!_description

    return _hasDiscountDescr &&
        <div className="discount-title">
            {_description}
        </div>
}

const mapStateToProps = (state) => {
    return {
        cookiesConfirmed: state.app.cookiesConfirmed,
    }
}

export default connect(mapStateToProps)(MobileButton)
