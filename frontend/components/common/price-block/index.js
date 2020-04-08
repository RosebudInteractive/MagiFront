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
import PriceTitle from "../../billing/price-title";
import DiscountTitle from "../../billing/discount-title";

class PriceBlock extends React.Component {

    static propTypes = {
        course: PropTypes.object,
        title: PropTypes.string,
        showPrice: PropTypes.bool,
    }

    static defaultProps = {
        title: 'Купить',
        showPrice: true,
    }


    render() {
        const {course, userPaidCourses, enabledPaidCourse, loading, loadingCourseId, title, showPrice} = this.props

        if (!enabledPaidCourse) {
            return null
        }

        if (!(course && (course.IsPaid && !course.IsGift && !course.IsBought)) || userPaidCourses.includes(course.Id)) {
            return null
        }

        let _hasDiscount = course.DPrice && course.Discount && course.Discount.Perc,
            _hasDiscountDescr = _hasDiscount && course.Discount.Description,
            _disabled = loading && (loadingCourseId === course.Id)

        return <div className={"course-module__price-block pay-button" + (!_hasDiscountDescr ? " _no-description" : "")}>
            <div className="course-module__price-block-wrapper button-block">
                <div className={"btn btn--brown course-module__price-btn" + (_disabled ? " disabled" : "")} onClick={::this._onClick}>{title}</div>
                { showPrice && <PriceTitle course={course}/> }
            </div>
            { showPrice && <DiscountTitle course={course}/> }
        </div>
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
        getPaidCourseInfo: bindActionCreators(getPaidCourseInfo, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps, null, { withRef: true })(PriceBlock);