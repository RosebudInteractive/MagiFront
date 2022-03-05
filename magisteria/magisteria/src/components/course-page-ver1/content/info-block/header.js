import React from 'react';
import PropTypes from 'prop-types';
import Info from '../../../course/course-module-info';
import PriceBlock from "../../../common/price-block";
import GiftBlock from './gift-block'
import GiftButton from "../../../billing/gift-button";
import "./header.sass"
import DiscountTitle from "../../../billing/discount-title";
import PriceTitle from "../../../billing/price-title";

export default class Header extends React.Component {

    static propTypes = {
        authors: PropTypes.array,
        categories: PropTypes.array,
        course: PropTypes.object,
    }

    render() {
        const {course} = this.props,
            _needShowPrice = course && (course.IsPaid && !course.IsGift && !course.IsBought)

        return (
            <div className="course-module__header">
                <Info authors={this.props.authors} categories={this.props.categories} showPhoto={true}/>
                <div className="header__button-block">
                    <div className="header__buttons-wrapper">
                        <PriceBlock course={this.props.course} showPrice={false}/>
                        <GiftButton course={this.props.course} title={"Подарить"}/>
                        { _needShowPrice && <PriceTitle course={this.props.course}/> }
                    </div>
                    { _needShowPrice && <DiscountTitle course={this.props.course}/> }
                </div>
                <GiftBlock visible={this.props.course && this.props.course.IsGift}/>
            </div>
        )
    }
}