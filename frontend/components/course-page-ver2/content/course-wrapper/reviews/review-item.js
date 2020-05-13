import React from 'react'
import PropTypes from 'prop-types'
import {Link} from "react-router-dom";
import $ from "jquery";

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

        this._resizeHandler = () => {
            const {review} = this.props

            const id = review.Id,
                _container = $(`#rev-${id}`)

            if (_container && (_container.length > 0)) {
                const _height = _container.height(),
                    _maxHeight = this._getMaxHeight()

                console.log(this.state)

                if ((_height > _maxHeight) && (!this.state.short) && (!this.state.showAll)) {
                    this.setState({ short: true, triggerVisible: true })
                }

                if (this.state.short && (_height <= _maxHeight)) {
                    this.setState({ short: false, triggerVisible: false })
                }
            }
        }
    }

    componentDidMount(){
        // $(window).bind('resize', this._resizeHandler)
        // this._resizeHandler();
    }

    componentWillUnmount() {
        // $(window).unbind('resize', this._resizeHandler);
    }


    render() {
        const {review} = this.props,
            _dtf = new Intl.DateTimeFormat('ru', { day: 'numeric', month: 'long', year: 'numeric', }),
            _date = _dtf.format(new Date(review.ReviewDate))

        // const {short, triggerVisible} = this.state,
        //     _title = short ? "далее" : "скрыть"

        return <div className="reviews__list-item">
            <div className="list-item__header">
                {
                    review.ProfileUrl
                        ?
                        <Link to={review.ProfileUrl} target="_blank" className="font-universal__title-smallx user-name _link">{review.UserName}</Link>
                            :
                        <div className="font-universal__title-smallx user-name">{review.UserName}</div>
                }
                <div className="font-universal__body-medium review-date">{_date}</div>
            </div>
            <div className="list-item__text-block">
                <div className="font-universal__body-medium text">{review.ReviewPub}</div>
                {/*<div className={"font-universal__body-medium text" + (short ? " _short" : "")}>{review.ReviewPub}</div>*/}
                {/*{ triggerVisible && <span className="more-trigger font-universal__body-medium" onClick={::this._toggle}>{_title}</span> }*/}
                {/*<div className="font-universal__body-medium hack" id={"rev-" + review.Id}>{review.ReviewPub}</div>*/}
            </div>
        </div>
    }

    // _toggle() {
    //     this.setState({
    //         showAll: !this.state.showAll,
    //         short: this.state.showAll
    //     })
    // }

    // _getMaxHeight() {
    //     return $(window).width() > 414 ? 126 : 160
    // }
}