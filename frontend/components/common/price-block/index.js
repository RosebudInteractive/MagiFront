import React from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from "redux";
import {showCoursePaymentWindow, getPaidCourseInfo} from "ducks/billing";
import {showSignInForm} from '../../../actions/user-actions'
import {userPaidCoursesSelector} from "ducks/profile";
import {connect} from 'react-redux';

class PriceBlock extends React.Component {

    static propTypes = {
        course: PropTypes.object,
    }


    render() {
        const {course, userPaidCourses,} = this.props

        if (!(course && course.IsPaid) || userPaidCourses.includes(course.Id)) {
            return null
        }

        let _hasDiscount = course.DPrice && course.Discount && course.Discount.Perc,
            _hasDiscountDescr = _hasDiscount && course.Discount.Description;

        return <div className="course-module__price-block">
            <div className="course-module__price-block-wrapper">
                <div className="btn btn--brown course-module__price-btn" onClick={::this._onClick}>Купить</div>
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
                            <span className="label">Персональная скидка.</span>
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

        this.props.getPaidCourseInfo(course.ProductId)
        this.props.showPaymentWindow()
    }
}

function mapStateToProps(state) {
    return {
        userPaidCourses : userPaidCoursesSelector(state),
        authorized: !!state.user.user,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        showPaymentWindow: bindActionCreators(showCoursePaymentWindow, dispatch),
        getPaidCourseInfo: bindActionCreators(getPaidCourseInfo, dispatch),
        showSignInForm: bindActionCreators(showSignInForm, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PriceBlock);