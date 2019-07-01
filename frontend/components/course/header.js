import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {Link} from 'react-router-dom';
import {
    addCourseToBookmarks,
    userBookmarksSelector,
    getUserBookmarks,
    removeCourseFromBookmarks
} from "../../ducks/profile";
import React from "react";
import PropTypes from "prop-types";
import * as userActions from "../../actions/user-actions"
import {getCrownForCourse} from "../../tools/svg-paths";
import {notifyCourseLinkClicked} from "ducks/google-analytics";

class Header extends React.Component {

    static  propTypes = {
        title: PropTypes.string.isRequired,
        url: PropTypes.string.isRequired,
        course: PropTypes.object,
    };

    constructor(props) {
        super(props)

        this._onLinkClickHandler = () => {
            const {course} = this.props

            this.props.notifyCourseLinkClicked({
                ...course,
                author: course.AuthorsObj[0].FirstName + course.AuthorsObj[0].LastName,
                category: course.CategoriesObj[0].Name,
                price: course.IsPaid ? (course.DPrice && course.Discount ? course.DPrice : course.Price) : 0
            })
        }
    }

    componentDidMount() {
        $(`#course-link${this.props.course.Id}`).bind("click", this._onLinkClickHandler)
    }

    componentWillUnmount() {
        $(`#course-link${this.props.course.Id}`).unbind("click", this._onLinkClickHandler)
    }


    _favoritesClick() {
        if (!this.props.authorized) {
            this.props.userActions.showSignInForm();
        } else {
            if (this._isCourseInBookmarks()) {
                this.props.removeCourseFromBookmarks(this.props.url)
            } else {
                this.props.addCourseToBookmarks(this.props.url)
            }
        }
    }



    _isCourseInBookmarks() {
        return this.props.bookmarks && this.props.bookmarks.find((item) => {
            return item === this.props.url
        })
    }

    render() {
        return (
            <h1 className="course-module__title">
                <span className={"favourites" + (this._isCourseInBookmarks() ? ' active' : '')} onClick={::this._favoritesClick}>В закладки</span>
                <Link to={'/category/' + this.props.url} id={`course-link${this.props.course.Id}`}>
                    <p className="course-module__label">
                        { getCrownForCourse(this.props.course) }
                        Курс:
                    </p>
                    <span>{this.props.title}</span>
                </Link>
            </h1>
        );
    }
}

function mapStateToProps(state) {
    return {
        bookmarks: userBookmarksSelector(state),
        authorized: !!state.user.user,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        getUserBookmarks: bindActionCreators(getUserBookmarks, dispatch),
        addCourseToBookmarks: bindActionCreators(addCourseToBookmarks, dispatch),
        removeCourseFromBookmarks: bindActionCreators(removeCourseFromBookmarks, dispatch),
        userActions: bindActionCreators(userActions, dispatch),
        notifyCourseLinkClicked: bindActionCreators(notifyCourseLinkClicked, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Header);