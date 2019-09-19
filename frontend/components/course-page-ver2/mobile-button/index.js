import React from 'react';
import PropTypes from 'prop-types';
import {isMobile} from "../../../tools/page-tools";
import PriceButton from "./price-button";
import PlayButton from "./play-button";
import './mobile-button.sass'

export default class MobileButton extends React.Component {

    static propTypes = {
        course: PropTypes.object,
    }

    render() {
        const {course} = this.props

        if (!course || !isMobile()) {
            return null
        }

        const _showPriceButton = course.IsPaid && !course.IsGift && !course.IsBought

        return <div className="mobile-button_wrapper">
            {
                _showPriceButton ?
                    <PriceButton course={course}/>
                    :
                    <PlayButton course={course}/>
            }
            <div className="mobile-button_background"/>
        </div>
    }
}