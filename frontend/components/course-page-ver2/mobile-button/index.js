import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {isMobile} from "../../../tools/page-tools";
import PriceButton from "./price-button";
import './mobile-button.sass'
import $ from "jquery";
import GiftButton from "../../billing/gift-button";
import CourseDiscounts, {getExpireTitle} from "tools/course-discount";

const REFRESH_INTERVAL = 60 * 1000

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

    componentWillUnmount() {
        $(window).unbind('resize', this._resizeHandler);
    }

    render() {
        const {course, cookiesConfirmed} = this.props

        if (!course || !isMobile()) {
            return null
        }

        const _style = cookiesConfirmed ? null : {marginBottom: this._getMarginBottom()}

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

class DiscountTitle extends React.Component {

    componentWillUnmount() {
        clearInterval(this._timer)
    }

    render() {
        const {course} = this.props,
            _activeDynamicDiscount = CourseDiscounts.getActiveDynamicDiscount({course}),
            _description = _activeDynamicDiscount
                ?
                <DynamicDiscountDescription expireDate={_activeDynamicDiscount.expireDate}
                                            percent={_activeDynamicDiscount.percent}/>
                :
                <CommonDiscountDescription course={course}/>,
            _hasDiscountDescr = !!_description

        this._toggleDiscountRefreshTimer(_activeDynamicDiscount)

        return _hasDiscountDescr &&
            <div className="discount-title">
                {_description}
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

const CommonDiscountDescription = (props) => {
    const {course} = props,
        _hasCommonDiscount = course.DPrice && course.Discount && course.Discount.Perc

    return (_hasCommonDiscount && course.Discount.Description) ?
        <div className="discount-title__text font-universal__body-medium _main-dark">
            {" " + course.Discount.Description}
        </div>
        :
        null
}

const DynamicDiscountDescription = (props) => {
    return <div className="discount-title__text font-universal__body-medium _main-dark">
        {"Ваша персональная скидка "}
        <span className="discount-title__text font-universal__body-medium _red _bold">
                    {props.percent + "%"}
                </span>
        {" активна еще "}
        <span className="discount-title__text font-universal__body-medium _red _bold">
                    {getExpireTitle(props.expireDate)}
                </span>
    </div>
}

const mapStateToProps = (state) => {
    return {
        cookiesConfirmed: state.app.cookiesConfirmed,
    }
}

export default connect(mapStateToProps)(MobileButton)
