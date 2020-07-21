import React from "react"
import CourseDiscounts, {getExpireTitle} from "tools/course-discount";
import PropTypes from "prop-types"
import {getCurrencySign} from "tools/page-tools";
import {Link} from "react-router-dom";
import moment from "moment";

export default class DiscountItem extends React.Component {
    constructor(props) {
        super(props)
    }

    static propTypes = {
        course: PropTypes.object,
        dynamic: PropTypes.bool,
        onClick: PropTypes.func,
    }

    render() {
        const {course, dynamic} = this.props,
            _discount = dynamic ? Object.values(course.DynDiscounts)[0] : course.Discount,
            _currency = getCurrencySign(),
            _expireDate = this._getExpireDate()

        return <Link to={`/category/${course.URL}`} className="discount-item__link" onClick={::this.props.onClick}>
            <div className="discount-item">
                <div className="discount-item__course-title font-universal__body-small">
                    <span className="_orange">Курс: </span>
                    {course.Name}
                </div>
                <div className="discount-item__price-block">
                    <div className="_red">{_discount.Perc + "%"}</div>
                    <div className="price">
                        <span className="old-price">{course.Price + _currency}</span>
                        <span>{course.Price + _currency}</span>
                    </div>
                </div>
                <div className="discount-item__remaining-time font-universal__body-small">
                    {_expireDate ? getExpireTitle(_expireDate) : ""}
                </div>
            </div>
        </Link>
    }

    _getExpireDate() {
        const {course, dynamic} = this.props

        if (dynamic) {
            return CourseDiscounts.getExpireDateForCourse({courseId: course.Id, code: Object.keys(course.DynDiscounts)[0]})
        } else {
            return course.Discount.LastDate ? moment(course.Discount.LastDate) : null
        }
    }
}
