import React from 'react'
import PropTypes from 'prop-types'
import {Link} from "react-router-dom";

export default class ReviewItem extends React.Component {

    static propTypes = {
        review: PropTypes.object,
    }

    constructor(props) {
        super(props)

        this.state = {
            short: false,
            showAll: false,
            triggerVisible: false
        }
    }

    render() {
        const {review} = this.props,
            _dtf = new Intl.DateTimeFormat('ru', { day: 'numeric', month: 'long', year: 'numeric', }),
            _date = _dtf.format(new Date(review.ReviewDate)).replace(/( г.)$/, "")

        return <div className="reviews__list-item">
            <div className="list-item__header">
                {
                    review.ProfileUrl
                        ?
                        <a href={review.ProfileUrl} target="_blank" className="font-universal__title-smallx user-name _link">{review.UserName}</a>
                            :
                        <div className="font-universal__title-smallx user-name">{review.UserName}</div>
                }
                <div className="font-universal__body-medium review-date">{_date}</div>
            </div>
            <div className="list-item__text-block">
                <div className="font-universal__body-medium text">{review.ReviewPub}</div>
            </div>
        </div>
    }
}