import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {Link} from 'react-router-dom';
import {
    addCourseToBookmarks,
    getCourseBookmarks,
    getUserBookmarks,
    removeCourseFromBookmarks
} from "../../ducks/profile";
import React from "react";
import PropTypes from "prop-types";

class Header extends React.Component {

    static  propTypes = {
        title: PropTypes.string.isRequired,
        url: PropTypes.string.isRequired,
    };

    _favoritesClick() {
        if (this._isCourseInBookmarks()) {
            this.props.removeCourseFromBookmarks(this.props.url)
        } else {
            this.props.addCourseToBookmarks(this.props.url)
        }
    }

    _isCourseInBookmarks() {
        return this.props.bookmarks.find((item) => {
            return item.URL === this.props.url
        })
    }

    render() {
        return (
            <h1 className="course-module__title">
                <span className={"favourites" + (this._isCourseInBookmarks() ? ' active' : '')} onClick={::this._favoritesClick}>В закладки</span>
                <Link to={'/category/' + this.props.url}>
                    <p className="course-module__label">Курс:</p>
                    <span>{this.props.title}</span>
                </Link>
            </h1>
        );
    }
}

function mapStateToProps(state) {
    return {
        bookmarks: getCourseBookmarks(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        getUserBookmarks: bindActionCreators(getUserBookmarks, dispatch),
        addCourseToBookmarks: bindActionCreators(addCourseToBookmarks, dispatch),
        removeCourseFromBookmarks: bindActionCreators(removeCourseFromBookmarks, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Header);