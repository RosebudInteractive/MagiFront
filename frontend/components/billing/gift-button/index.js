import React from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from "redux";
import {
    getPaidCourseInfo,
    isRedirectActiveSelector,
    loadingSelector,
    loadingCourseIdSelector,
} from "ducks/billing";
import {enabledPaidCoursesSelector} from "ducks/app";
import {connect} from 'react-redux';
import "./gift-button.sass";
import {getAuthorAndCategory} from "../common-functions";

class GiftButton extends React.Component {

    static propTypes = {
        course: PropTypes.object,
        title: PropTypes.string,
    }

    static defaultProps = {
        title: 'Подарить курс',
    }

    constructor(props) {
        super(props)

        this._getAuthorAndCategory = getAuthorAndCategory.bind(this)
    }

    render() {
        const {course, enabledPaidCourse, loading, loadingCourseId, title} = this.props

        if (!enabledPaidCourse) {
            return null
        }

        if (!(course && course.IsPaid)) {
            return null
        }

        let _disabled = loading && (+loadingCourseId === course.Id)

        return <div className={"course-module__gift-button pay-button"}>
                <div className={"btn btn-white font-universal__button-default" + (_disabled ? " disabled" : "")} onClick={::this._onClick}>{title}</div>
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
            buyAsGift: true,
        })
    }
}

function mapStateToProps(state) {
    return {
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

export default connect(mapStateToProps, mapDispatchToProps, null, { withRef: true })(GiftButton);