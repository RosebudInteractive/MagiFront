import React from 'react';
import PropTypes from 'prop-types';
import {
    addLessonToBookmarks,
    getUserBookmarks,
    removeLessonFromBookmarks,
    userBookmarksSelector
} from "ducks/profile";
import * as userActions from "actions/user-actions";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";

class FavoritesButton extends React.Component {

    static propTypes = {
        className: PropTypes.string.isRequired,
        lessonUrl: PropTypes.string,
        courseUrl: PropTypes.string,
    };

    render() {
        let {lessonUrl, className} = this.props;

        const _flag = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#flag"/>',
            _redFlag = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#flag-red"/>'

        return (
            <button type="button" className={className} onClick={() => {::this._switchFavorites(lessonUrl)}}>
                <svg width="14" height="23"
                     dangerouslySetInnerHTML={{__html: this._isLessonInBookmarks(lessonUrl) ? _redFlag : _flag}}/>
            </button>

        )
    }

    _switchFavorites(lessonUrl) {
        let {courseUrl} = this.props;

        if (!this.props.authorized) {
            this.props.userActions.showSignInForm();
        } else {
            if (this._isLessonInBookmarks(lessonUrl)) {
                this.props.removeLessonFromBookmarks(courseUrl, lessonUrl)
            } else {
                this.props.addLessonToBookmarks(courseUrl, lessonUrl)
            }
        }
    }

    _isLessonInBookmarks(lessonUrl) {
        let {courseUrl} = this.props;

        return this.props.bookmarks && this.props.bookmarks.find((item) => {
            return item === courseUrl + '/' + lessonUrl
        })
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
        addLessonToBookmarks: bindActionCreators(addLessonToBookmarks, dispatch),
        removeLessonFromBookmarks: bindActionCreators(removeLessonFromBookmarks, dispatch),
        userActions: bindActionCreators(userActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(FavoritesButton);