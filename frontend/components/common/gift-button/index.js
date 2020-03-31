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

class GiftButton extends React.Component {

    static propTypes = {
        course: PropTypes.object,
        title: PropTypes.string,
    }

    static defaultProps = {
        title: 'Купить'
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

        let _hasDiscount = course.DPrice && course.Discount && course.Discount.Perc,
            _hasDiscountDescr = _hasDiscount && course.Discount.Description,
            _disabled = loading && (loadingCourseId === course.Id)

        return <div className={"course-module__price-block" + (!_hasDiscountDescr ? " _no-description" : "")}>
            <div className="course-module__price-block-wrapper button-block">
                <div className={"btn btn--brown course-module__price-btn" + (_disabled ? " disabled" : "")} onClick={::this._onClick}>{title}</div>
                <div className="course-module__price-block-section">
                    {
                        _hasDiscount ?
                            <React.Fragment>
                                <p className="course-module__price">{course.DPrice + _currency + " "}<span className="discount">{`-${course.Discount.Perc}%`}</span></p>
                                <p className="course-module__old-price">{course.Price + _currency}</p>
                            </React.Fragment>
                            :
                            <p className="course-module__price">{course.Price + _currency}</p>
                    }
                </div>
            </div>
            {
                _hasDiscountDescr ?
                    <div className="course-module__price-block-wrapper">
                        <p className="course-module__price-block-info">
                            {/*<span className="label">Персональная скидка.</span>*/}
                            {" " + course.Discount.Description}
                        </p>
                    </div>
                    :
                    null
            }
        </div>
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

export default connect(mapStateToProps, mapDispatchToProps, null, { withRef: true })(GiftButton);