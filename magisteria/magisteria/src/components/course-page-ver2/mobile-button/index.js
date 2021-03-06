import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {isMobile} from "../../../tools/page-tools";
import PriceButton from "./price-button";
import './mobile-button.sass'
import $ from "jquery";
import GiftButton from "../../billing/gift-button";
import CourseDiscounts, {getExpireTitle} from "tools/course-discount";
import {localSettingsSelector} from "ducks/app";
import AvailabilityTitle from "../content/statistic/availability-title";

const REFRESH_INTERVAL = 60 * 1000

const DISCOUNT = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#discount"/>'

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
        const {course, localSettings} = this.props

        if (!course || !isMobile()) {
            return null
        }

        const _style = localSettings.popup.cookiesConfirmed ? null : {marginBottom: this._getMarginBottom()}

        const _showPriceButton = course.IsPaid && !course.IsGift && !course.IsBought

        return _showPriceButton &&
            <div className="mobile-buttons__block js-mobile-buttons-block" style={_style}>
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

        return (_message && _message.length) ? _message.height() : 6
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
    return <div className="discount-title__wrapper">
        <div className="message__icon">
            <svg width="30" height="30" dangerouslySetInnerHTML={{__html: DISCOUNT}}/>
        </div>
        <div className="discount-title__text font-universal__body-medium _main-dark">
        {"???????? ???????????????????????? ???????????? "}
        <span className="discount-title__text font-universal__body-medium _red _bold">
            {props.percent + "%"}
        </span>
        {" ?????????????? ?????? "}
        <span className="discount-title__text font-universal__body-medium _red _bold expire-date">
            {getExpireTitle(props.expireDate)}
        </span>
    </div>
        </div>
}

const mapStateToProps = (state) => {
    return {
        localSettings: localSettingsSelector(state),
    }
}

export default connect(mapStateToProps)(MobileButton)
