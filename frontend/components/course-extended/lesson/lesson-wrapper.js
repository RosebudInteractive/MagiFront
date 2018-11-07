import React from 'react';
import PropTypes from 'prop-types';

import PlayBlock from '../../common/play-block';
import {Link} from 'react-router-dom';
import {
    addLessonToBookmarks,
    userBookmarksSelector,
    getUserBookmarks,
    removeLessonFromBookmarks
} from "../../../ducks/profile";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import * as userActions from "../../../actions/user-actions";
import Sublessons from '../sublessons'

export class LessonFull extends React.Component {

    static propTypes = {
        id: PropTypes.number,
        title: PropTypes.string,
        url: PropTypes.string,
        courseUrl: PropTypes.string,
        lessonUrl: PropTypes.string,
        descr: PropTypes.string,
        cover: PropTypes.string,
        duration: PropTypes.string,
        totalDuration: PropTypes.number,
        subLessons: PropTypes.array,
        refs: PropTypes.number,
        books: PropTypes.number,
        audios: PropTypes.array,
        isAuthRequired: PropTypes.bool,
        needShowAuthors: PropTypes.bool,
    };

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

    _favoritesClick() {
        this._switchFavorites(this.props.lessonUrl)
    }

    _isLessonInBookmarks(lessonUrl) {
        let {courseUrl} = this.props;

        return this.props.bookmarks && this.props.bookmarks.find((item) => {
            return item === courseUrl + '/' + lessonUrl
        })
    }

    render() {
        let {lesson, lessonUrl, needShowAuthors} = this.props;

        const _flag = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#flag"/>',
            _redFlag = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#flag-red"/>'

        return (
            <li className="lecture-full">
                <div className="lecture-full__wrapper">
                    <PlayBlock {...this.props}/>
                    <div className="lecture-full__info-block">
                        <div className="lecture-full__text-block">
                            <button type="button" className="lecture-full__fav" onClick={::this._favoritesClick}>
                                <svg width="14" height="23"
                                     dangerouslySetInnerHTML={{__html: this._isLessonInBookmarks(lessonUrl) ? _redFlag : _flag}}/>
                            </button>
                            <h3 className="lecture-full__title"><Link to={this.props.url}>{this.props.title}</Link></h3>
                            <p className="lecture-full__descr">
                                {' ' + this.props.descr + ' '}
                                {needShowAuthors ? <p className="lecture-full__author">{lesson.authorName}</p> : null}
                            </p>
                        </div>
                        <Sublessons subLessons={lesson.Lessons}
                                parentNumber={lesson.Number}
                                isLessonInBookmarks={::this._isLessonInBookmarks}
                                onSwitchFavorites={::this._switchFavorites}
                                courseUrl={this.props.courseUrl}/>
                    </div>
                </div>
            </li>
        )
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

export default connect(mapStateToProps, mapDispatchToProps)(LessonFull);