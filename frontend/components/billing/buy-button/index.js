import React from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from "redux";
import {
    getPaidCourseInfo,
    isRedirectActiveSelector,
    loadingSelector,
    loadingCourseIdSelector,
} from "ducks/billing";
import {userPaidCoursesSelector} from "ducks/profile";
import {enabledPaidCoursesSelector} from "ducks/app";
import {connect} from 'react-redux';
import PriceTitle from "../price-title";
import DiscountTitle from "../discount-title";
import {getAuthorAndCategory} from "../common-functions";

class PriceBlock extends React.Component {

    static propTypes = {
        course: PropTypes.object,
        title: PropTypes.string,
    }

    static defaultProps = {
        title: 'Купить',
    }


    constructor(props) {
        super(props)

        this._getAuthorAndCategory = getAuthorAndCategory.bind(this)
    }

    render() {
        const {course, userPaidCourses, enabledPaidCourse, loading, loadingCourseId, title,} = this.props

        if (!enabledPaidCourse) {
            return null
        }

        if (!(course && (course.IsPaid && !course.IsGift && !course.IsBought)) || userPaidCourses.includes(course.Id)) {
            return null
        }

        let _disabled = loading && (loadingCourseId === course.Id)

        return <div className={"btn btn--brown course-module__price-btn" + (_disabled ? " disabled" : "")} onClick={::this._onClick}>{title}</div>
    }

    _onClick() {
        const {course} = this.props,
            _returnUrl = '/category/' + course.URL,
            {author, category} = this._getAuthorAndCategory();

        this.props.getPaidCourseInfo({
            courseId: course.Id,
            productId: course.ProductId,
            returnUrl: _returnUrl,
            author: author,
            category: category,
            name: course.Name,
            buyAsGift: false,
        })
    }
}

function mapStateToProps(state) {
    return {
        userPaidCourses : userPaidCoursesSelector(state),
        authorized: !!state.user.user,
        enabledPaidCourse: enabledPaidCoursesSelector(state),
        loading: isRedirectActiveSelector(state) || loadingSelector(state),
        loadingCourseId: loadingCourseIdSelector(state)
    }
}

function mapDispatchToProps(dispatch) {
    return {
        getPaidCourseInfo: bindActionCreators(getPaidCourseInfo, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps, null, { withRef: true })(PriceBlock);