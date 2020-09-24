import React from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from "redux";
import {
    getPaidCourseInfo,
    isRedirectActiveSelector,
    loadingSelector,
    loadingCourseIdSelector,
    showCoursePaymentWindow,
} from "ducks/billing";
import {showSignInForm} from '../../../actions/user-actions'
import {userPaidCoursesSelector} from "ducks/profile";
import {enabledPaidCoursesSelector} from "ducks/app";
import {connect} from 'react-redux';
import {getCurrencySign} from "../../../tools/page-tools";
import CourseDiscounts from "tools/course-discount";

const CROWN = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#crown"/>'

const REFRESH_INTERVAL = 60 * 1000

class PriceButton extends React.Component {

    static propTypes = {
        course: PropTypes.object,
    }

    componentWillUnmount() {
        clearInterval(this._timer)
    }

    render() {
        const {course, userPaidCourses, enabledPaidCourse, loading, loadingCourseId, title} = this.props,
            _currency = getCurrencySign()

        if (!enabledPaidCourse) {
            return null
        }

        if (!(course && (course.IsPaid && !course.IsGift && !course.IsBought)) || userPaidCourses.includes(course.Id)) {
            return null
        }

        let {hasDiscount, price, percent, dynamicDiscount} = CourseDiscounts.getActualPriceAndDiscount({course}),
            _disabled = loading && (+loadingCourseId === course.Id)

        this._toggleDiscountRefreshTimer(dynamicDiscount)

        return <div className="mobile-button _price-block btn btn--brown" onClick={::this._onClick}>
                <div className="price-button__crown">
                    <svg className="course-module__label-icon" width="18" height="18" fill="#FFF" dangerouslySetInnerHTML={{__html: CROWN}}/>
                </div>
                <div className={"course-module__price-btn" + (_disabled ? " disabled" : "")}>{`Купить ${price + _currency} `}</div>
                <div className="course-module__price-block-section">
                    {
                        hasDiscount ?
                            <React.Fragment>
                                <div className="course-module__price"><span className="discount">{`-${percent}%`}</span></div>
                                <div className="course-module__old-price">{course.Price + _currency}</div>
                            </React.Fragment>
                            :
                            null
                    }
                </div>
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

    _onClick() {
        const {course} = this.props,
            _returnUrl = '/category/' + course.URL,
            {author, category} = this._getAuthorAndCategory();

        this.props.getPaidCourseInfo({courseId: course.Id, productId: course.ProductId, returnUrl: _returnUrl, author: author, category: category, name: course.Name})
    }

    _getAuthorAndCategory() {
        const {course} = this.props

        let _author = 'unknown',
            _category = 'unknown';

        if (course.hasOwnProperty("AuthorsObj")) {
            _author = course.AuthorsObj && course.AuthorsObj[0] ? course.AuthorsObj[0].FirstName + " " + course.AuthorsObj[0].LastName : ''
        } else if (course.hasOwnProperty("authors")) {
            _category = course.categories && course.categories[0] ? course.categories[0].Name : ''
        } else if (course.hasOwnProperty("Authors")) {
            _author = course.Authors && course.Authors[0] ? course.Authors[0].FirstName + " " + course.Authors[0].LastName : ''
        }  else if (course.hasOwnProperty("author")) {
            _author = course.author
        }

        if (course.hasOwnProperty("CategoriesObj")) {
            _category = course.CategoriesObj && course.CategoriesObj[0] ? course.CategoriesObj[0].Name : '';
        } else if (course.hasOwnProperty("categories")) {
            _category = course.categories && course.categories[0] ? course.categories[0].Name : ''
        } else if (course.hasOwnProperty("Categories")) {
            _category = course.Categories && course.Categories[0] ? course.Categories[0].Name : ''
        }

        return {author: _author, category: _category}
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
        showPaymentWindow: bindActionCreators(showCoursePaymentWindow, dispatch),
        getPaidCourseInfo: bindActionCreators(getPaidCourseInfo, dispatch),
        showSignInForm: bindActionCreators(showSignInForm, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps,)(PriceButton);
