import React from "react";
import {connect} from "react-redux";
import PropTypes from 'prop-types';
import {
    getCourseBookmarks,
    removeCourseFromBookmarks,
    addCourseToBookmarks,
    userBookmarksSelector,
    loadingBookmarksSelector,
    loadingUserBookmarksSelector,
} from '../../ducks/profile'
import {bindActionCreators} from "redux";
import Item from "./course-item";
import Message from "./favourites-message";

class LessonsBlock extends React.Component {

    static propTypes = {
        active: PropTypes.bool,
    }

    constructor(props) {
        super(props);
    }

    _isCourseInBookmarks(course) {
        return this.props.userBookmarks && this.props.userBookmarks.find((item) => {
            return item === course.URL
        })
    }

    _favoritesClick(course) {
        if (this._isCourseInBookmarks(course)) {
            this.props.removeCourseFromBookmarks(course.URL)
        } else {
            this.props.addCourseToBookmarks(course.URL)
        }
    }

    _getList() {
        let {bookmarks} = this.props;

        return (bookmarks.size > 0) ?
            bookmarks.map((item, index) => {
                return <Item item={item} key={index} onRemoveItem={::this._favoritesClick}
                             isFavorite={this._isCourseInBookmarks(item)}/>
            }) :
            <Message/>
    }

    render() {
        let {loading} = this.props;

        return (
            !loading ?
                <div className={"profile-block__tab" + (this.props.active ? " active" : "")}>
                    <div className="favourites">
                        {this._getList()}
                    </div>
                </div>
                :
                null
        )
    }
}

function mapStateToProps(state) {
    return {
        bookmarks: getCourseBookmarks(state),
        userBookmarks: userBookmarksSelector(state),
        loading: loadingBookmarksSelector(state) || loadingUserBookmarksSelector(state)
    }
}

function mapDispatchToProps(dispatch) {
    return {
        removeCourseFromBookmarks: bindActionCreators(removeCourseFromBookmarks, dispatch),
        addCourseToBookmarks: bindActionCreators(addCourseToBookmarks, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LessonsBlock);