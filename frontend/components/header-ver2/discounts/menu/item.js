import React from "react"
import {getExpireTitle} from "tools/course-discount";
import PropTypes from "prop-types"

export default class DiscountItem extends React.Component {
    constructor(props) {
        super(props)
    }

    static propTypes = {
        course: PropTypes.object
    }

    render() {
        const {course} = this.props

        return <div className="discount-item">
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
    }
}
