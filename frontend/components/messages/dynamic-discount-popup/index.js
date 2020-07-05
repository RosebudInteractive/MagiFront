import React from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import "./discount-popup.sass"
import BuyButton from "../../billing/buy-button";
import {Link} from "react-router-dom";
import {COURSES} from "../../../mock-data/course/mock";
import CourseDiscounts, {getExpireTitle} from "tools/course-discount";
import {getCurrencySign} from "tools/page-tools";
import {closeDynamicDiscountPopup, dynamicDiscountSelector} from "ducks/message";
import $ from "jquery";
import {visibleCourseSelector} from "ducks/course";

const DISCOUNT = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#discount"/>'

const REFRESH_INTERVAL = 60 * 1000

class DynamicDiscountPopup extends React.Component {

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

    componentDidUpdate(prevProps) {
        if (prevProps.visibleCourseId !== this.props.visibleCourseId) {
            this.forceUpdate()
        }
    }

    render() {
        const {course, showPopup} = this.props.dynamicDiscount

        if (!course || !showPopup)  return null

        const {hasDiscount, dynamicDiscount, price, percent, expireDate} = CourseDiscounts.getActualPriceAndDiscount({course}),
            _currency = getCurrencySign()

        this._toggleDiscountRefreshTimer(hasDiscount && dynamicDiscount)

        if (!hasDiscount || !dynamicDiscount) return null

        const _style = this._getStyle()

        return <div className="dynamic-discount-popup" style={_style}>
                <Link to={`/category/${course.URL}`} className="discount-popup__wrapper" onClick={::this._scrollToTop}>
                    <div className="popup-header">
                        У Вас новая персональная скидка
                    </div>
                    <div className="popup-message font-universal__body-small">
                        <div className="message__icon">
                            <svg width="30" height="30" dangerouslySetInnerHTML={{__html: DISCOUNT}}/>
                        </div>
                        <div className="message__course-title">
                            <span className="_orange">Курс: </span>
                            {course.Name}
                        </div>
                        <div className="message__price-block">
                            <div className="_red">{percent + "%"}</div>
                            <div className="price">
                                <span className="old-price">{course.Price + _currency}</span>
                                <span>{price + _currency}</span>
                            </div>
                        </div>
                        <div className="message__remaining-time">
                            {getExpireTitle(expireDate)}
                        </div>
                    </div>
                    <BuyButton course={COURSES.HIGH_RENAISSANCE}/>
                </Link>
                <button type="button" className="close-button" onClick={::this.props.close}>Закрыть
                </button>
            </div>
    }

    _toggleDiscountRefreshTimer(active) {
        if (active) {
            if (!this._timer) {
                this._timer = setInterval(() => {this.forceUpdate()}, REFRESH_INTERVAL)
            }
        } else {
            if (this._timer) {
                clearInterval(this._timer)
                this._timer = null
                this.props.close()
            }
        }
    }

    _scrollToTop() {
        window.scrollTo(0, 0)
    }

    _getStyle() {
        let _mobileButtons = $('.js-mobile-buttons-block'),
            _message = $('.js-cookies-popup')

        let _bottom = 20

        _bottom = _bottom + ((_mobileButtons && _mobileButtons.length) ? _mobileButtons.outerHeight() : 0) +
            ((!this.props.cookiesConfirmed && _message && _message.length) ? _message.height() : 0)

        return {bottom: _bottom}
    }
}

function mapStateToProps(state) {
    return {
        dynamicDiscount: dynamicDiscountSelector(state),
        visibleCourseId: visibleCourseSelector(state),
        cookiesConfirmed: state.app.cookiesConfirmed,
        currentPage: state.pageHeader.currentPage,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        close: bindActionCreators(closeDynamicDiscountPopup, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(DynamicDiscountPopup);
