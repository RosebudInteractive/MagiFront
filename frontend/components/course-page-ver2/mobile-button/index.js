import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {isInViewport, isMobile} from "../../../tools/page-tools";
import PriceButton from "./price-button";
import PlayButton from "./play-button";
import './mobile-button.sass'
import $ from "jquery";
import GiftButton from "../../billing/gift-button";

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

        const _style = cookiesConfirmed ? null : {marginBottom : this._getMarginBottom()}

        const _showPriceButton = course.IsPaid && !course.IsGift && !course.IsBought

        return _showPriceButton &&
            <div className="mobile-buttons__block" style={_style}>
                <div className="mobile-button_wrapper price-button__wrapper">
                    <PriceButton course={course}/>
                    <div className="mobile-button_background"/>
                </div>
                <div className="mobile-button_wrapper gift-button__wrapper">
                    <GiftButton course={course}/>
                    <div className="mobile-button_background"/>
                </div>
                {/*<div className="mobile-button_wrapper">*/}
                {/*    <PlayButton course={course}/>*/}
                {/*    <div className="mobile-button_background"/>*/}
                {/*</div>*/}
            </div>
    }

    _getMarginBottom() {
        let _message = $('.js-cookies-popup')

        return (_message && _message.length) ? _message.height() + 8 : 6
    }
}

const mapStateToProps = (state) => {
    return {
        cookiesConfirmed: state.app.cookiesConfirmed,
    }
}

export default connect(mapStateToProps)(MobileButton)