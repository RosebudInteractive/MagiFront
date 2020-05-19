import React from 'react'
import PropTypes from 'prop-types'
import './reviews.sass'
import ReviewItem from "./review-item";
import {getCountReviewsTitle} from "tools/word-tools";

export default class Reviews extends React.Component {

    static propTypes = {
        reviews: PropTypes.array,
    }

    constructor(props) {
        super(props)

        this.state = {
            showAll: false,
            expanded: false,
        }
    }

    render() {
        const {reviews} = this.props

        if (!(reviews && Array.isArray(reviews) && (reviews.length > 0))) { return null }

        const _needShowMoreButton = reviews.length > 1,
            _showMoreTitle = _needShowMoreButton ? `Еще ${reviews.length - 1} ${getCountReviewsTitle(reviews.length - 1)}` : null

        return <div className="course-wrapper__reviews block-wrapper">
            <div className="reviews__title block-title">Отзывы</div>
            <div className={"reviews__list" + (this.state.expanded ? " _expanded" : "")}>
                {
                    this.state.showAll && (reviews.length > 1)
                        ?
                        reviews.map( item => <ReviewItem review={item}/> )
                        :
                        <ReviewItem review={reviews[0]}/>
                }
            </div>
            {
                _needShowMoreButton &&
                    <div className={"course-wrapper__more-button wrapper-item"}>
                        <span onClick={::this._switchShowMore}>{this.state.showAll ? "Скрыть" : _showMoreTitle}</span>
                    </div>
            }
        </div>
    }

    _switchShowMore() {
        if (this.state.showAll) {
            this.setState({showAll: false})
        } else {
            this.setState({showAll: true})
        }
    }
}