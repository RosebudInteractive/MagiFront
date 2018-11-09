import React from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from "redux";
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';

import PlayBlock from './sublesson/play-block'
import PlayBlockSmall from './sublesson/play-block-small'

import {getCoverPath, ImageSize} from "../../tools/page-tools";
import * as userActions from "../../actions/user-actions";
import {
    addLessonToBookmarks,
    getUserBookmarks,
    removeLessonFromBookmarks,
    userBookmarksSelector
} from "../../ducks/profile";

class LessonInfo extends React.Component {

    static propTypes = {
        lesson: PropTypes.object,
    }

    _favoritesClick(courseUrl, lessonUrl) {
        if (!this.props.authorized) {
            this.props.userActions.showSignInForm();
        } else {
            if (this._isLessonInBookmarks()) {
                this.props.removeLessonFromBookmarks(courseUrl, lessonUrl)
            } else {
                this.props.addLessonToBookmarks(courseUrl, lessonUrl)
            }
        }
    }

    _isLessonInBookmarks(courseUrl, lessonUrl) {
        return this.props.bookmarks && this.props.bookmarks.find((item) => {
            return item === courseUrl + '/' + lessonUrl
        })
    }

    _getSublessonList() {
        const _flag = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#flag"/>',
            _redFlag = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#flag-red"/>';

        let {lesson} = this.props;

        return lesson.Childs.map((item) => {
            let _cover = getCoverPath(item, ImageSize.icon),
                _inFavorites = this._isLessonInBookmarks(item.courseUrl, item.URL)

            return (
                <li>
                    <Link to={"/" + item.courseUrl + '/' + item.URL} className="extras-list__item">
                        <span className="inner-counter">{item.Number}</span>
                        {item.Name + ' '}
                        <span className="duration">{item.DurationFmt}</span>
                    </Link>
                    <PlayBlockSmall lesson={item} cover={_cover}/>
                    <PlayBlock lesson={item} cover={_cover}/>
                    <button className="extras-list__fav" type="button"
                            onClick={() => {
                                this._favoritesClick(item.courseUrl, item.URL)
                            }}>
                        <svg width="14" height="23"
                             dangerouslySetInnerHTML={{__html: _inFavorites ? _redFlag : _flag}}/>
                    </button>
                </li>
            )
        })
    }

    render() {
        let {lesson} = this.props;

        return (
            lesson && lesson.Childs && (lesson.Childs.length > 0)
                ?
                <section className="lecture-info">
                    <div className="lecture-info__wrapper">
                        {/*<InfoBlock lesson = {lesson}/>*/}
                        {/*<SocialBlock/>*/}
                        <div className="lecture-info__extras">
                            <p className="lecture-info__extras-label">Доп<span
                                className="mobile">олнительные</span><span
                                className="desktop">.</span> эпизоды</p>
                            <ol className="lecture-info__extras-list extras-list _full" data-number="10">
                                {this._getSublessonList()}
                            </ol>
                        </div>
                    </div>
                </section>
                :
                null
        )
    }
}

class InfoBlock extends React.Component {

    render() {
        let {lesson} = this.props;

        return (
            <div className="lecture-info__block _mobile">
                <h2 className="lecture-info__title">
                    <span className="number">{lesson.Number + '. '}</span>{lesson.Name}
                </h2>
                <p className="lecture-info__descr">{lesson.ShortDescription + ' '}
                    <span
                        className="lecture-info__author">{lesson.Author.FirstName + ' ' + lesson.Author.LastName}</span>
                </p>
            </div>
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
        userActions: bindActionCreators(userActions, dispatch),
        getUserBookmarks: bindActionCreators(getUserBookmarks, dispatch),
        addLessonToBookmarks: bindActionCreators(addLessonToBookmarks, dispatch),
        removeLessonFromBookmarks: bindActionCreators(removeLessonFromBookmarks, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LessonInfo);