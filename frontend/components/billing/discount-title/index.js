import React from 'react';
import PropTypes from 'prop-types';
import CourseDiscounts, {getExpireTitle} from "tools/course-discount";

const REFRESH_INTERVAL = 60 * 1000

export default class DiscountTitle extends React.Component {

    static propTypes = {
        course: PropTypes.object,
    }

    componentWillUnmount() {
        clearInterval(this._timer)
    }

    render() {
        const {course,} = this.props,

            _activeDynamicDiscount = CourseDiscounts.getActiveDynamicDiscount({course}),
            _description = _activeDynamicDiscount
                ?
                <DynamicDiscountDescription expireDate={_activeDynamicDiscount.expireDate}/>
                :
                <CommonDiscountDescription course={course}/>,
            _hasDiscountDescr = !!_description

        this._toggleDiscountRefreshTimer(_activeDynamicDiscount)

        return _hasDiscountDescr &&
            <div className="course-module__price-block-wrapper">
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
        <p className="course-module__price-block-info font-universal__body-large _main-dark">
            {" " + course.Discount.Description}
        </p>
        :
        null
}

const DynamicDiscountDescription = (props) => {
    return <p className="course-module__price-block-info font-universal__body-large _main-dark">
        {"Ваша персональная скидка активна еще "}
        <span className="price-block-info_expire-date font-universal__body-large _red _bold">
            {getExpireTitle(props.expireDate)}
        </span>
    </p>
}
