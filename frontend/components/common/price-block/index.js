import React from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from "redux";
import {
    getPaidCourseInfo,
    getPendingCourseInfo,
    isRedirectActiveSelector,
    loadingSelector,
    loadingCourseIdSelector,
    showCoursePaymentWindow,
} from "ducks/billing";
import {showSignInForm} from '../../../actions/user-actions'
import {userPaidCoursesSelector} from "ducks/profile";
import {enabledPaidCoursesSelector} from "ducks/app";
import {connect} from 'react-redux';

class PriceBlock extends React.Component {

    static propTypes = {
        course: PropTypes.object,
    }


    render() {
        const {course, userPaidCourses, enabledPaidCourse, loading, loadingCourseId} = this.props

        if (!enabledPaidCourse) {
            return null
        }

        if (!(course && (course.IsPaid && !course.IsGift && !course.IsBought)) || userPaidCourses.includes(course.Id)) {
            return null
        }

        let _hasDiscount = course.DPrice && course.Discount && course.Discount.Perc,
            _hasDiscountDescr = _hasDiscount && course.Discount.Description,
            _disabled = loading && (loadingCourseId === course.Id)

        return <div className="course-module__price-block">
            <div className="course-module__price-block-wrapper">
                <div className={"btn btn--brown course-module__price-btn" + (_disabled ? " disabled" : "")} onClick={::this._onClick}>Купить</div>
                <div className="course-module__price-block-section">
                    {
                        _hasDiscount ?
                            <React.Fragment>
                                <p className="course-module__price">{course.DPrice + "₽ "}<span className="discount">{`-${course.Discount.Perc}%`}</span></p>
                                <p className="course-module__old-price">{course.Price + "₽"}</p>
                            </React.Fragment>
                            :
                            <p className="course-module__price">{course.Price + "₽"}</p>
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
        if (!this.props.authorized) {
            this.props.showSignInForm();
        }

        const {course} = this.props;

        const _returnUrl = '/category/' + course.URL;

        if (course.IsPending) {
            this.props.getPendingCourseInfo({courseId: course.Id, productId: course.ProductId, returnUrl: _returnUrl})
        } else {
            this.props.getPaidCourseInfo({courseId: course.Id, productId: course.ProductId, returnUrl: _returnUrl})
        }

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
        getPendingCourseInfo: bindActionCreators(getPendingCourseInfo, dispatch),
        showSignInForm: bindActionCreators(showSignInForm, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps, null, { withRef: true })(PriceBlock);