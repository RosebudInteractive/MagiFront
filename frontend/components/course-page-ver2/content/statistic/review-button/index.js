import React from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from "redux";
import {
    getPaidCourseInfo,
    isRedirectActiveSelector,
    loadingSelector,
    loadingCourseIdSelector,
} from "ducks/billing";
import {showReviewWindow} from "ducks/message";
import {connect} from 'react-redux';
import "./review-button.sass";
import $ from "jquery";
import {isMobile, isPhoneViewPort} from "tools/page-tools";

class ReviewButton extends React.Component {

    static propTypes = {
        course: PropTypes.object,
        alwaysVisible: PropTypes.bool,
    }

    static defaultProps = {
        alwaysVisible: false,
    }

    constructor(props) {
        super(props)

        this.state = {
            isMobile: ($(window).width() <= 414),
        }

        this._handleResize = function() {
            let _newValue = ($(window).width() <= 414)

            if (this.state.isMobile !== _newValue) {
                this.setState({isMobile: _newValue})
            }
        }.bind(this)

        this._addEventListeners();
    }

    componentDidMount() {
        this._handleResize();
    }

    componentWillUnmount() {
        this._removeEventListeners();
    }

    render() {
        const {course, loading, loadingCourseId, authorized} = this.props,
            _needShowButton = !!authorized && course && (!course.IsPaid || (course.IsPaid && (course.IsBought || course.IsGift)))

        if (!_needShowButton) { return null }

        let _disabled = loading && (+loadingCourseId === course.Id),
            _caption = this.state.isMobile ? "Отзыв" : "Оставить отзыв"

        return <div className="course-module__review-button button _brown" onClick={::this._showReview}>
            <div className={"font-universal__button-default caption" + (_disabled ? " disabled" : "")}>{_caption}</div>
        </div>
    }

    _showReview() {
        this.props.showReviewWindow({courseId: this.props.course.Id})
    }

    _addEventListeners() {
        $(window).bind('resize', this._handleResize)
    }

    _removeEventListeners() {
        $(window).unbind('resize', this._handleResize)
    }
}

function mapStateToProps(state) {
    return {
        authorized: !!state.user.user,
        loading: isRedirectActiveSelector(state) || loadingSelector(state),
        loadingCourseId: loadingCourseIdSelector(state)
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({showReviewWindow,}, dispatch)

}

export default connect(mapStateToProps, mapDispatchToProps)(ReviewButton);