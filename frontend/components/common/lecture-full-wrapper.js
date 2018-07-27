import React from 'react';
import PropTypes from 'prop-types';

import PlayBlock from './play-block';
import {Link} from 'react-router-dom';
import {
    addLessonToBookmarks,
    userBookmarksSelector,
    getUserBookmarks,
    removeLessonFromBookmarks
} from "../../ducks/profile";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import * as userActions from "../../actions/user-actions";

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
    };

    _favoritesClick() {
        let {courseUrl, lessonUrl} = this.props;

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

    _isLessonInBookmarks() {
        let {courseUrl, lessonUrl} = this.props;

        return this.props.bookmarks && this.props.bookmarks.find((item) => {
            return item === courseUrl + '/' + lessonUrl
        })
    }

    render() {
        const _flag = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#flag"/>',
            _redFlag = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#flag-red"/>'

        return (
            <li className="lecture-full">
                <div className="lecture-full__wrapper">
                    <PlayBlock {...this.props}/>
                    <InfoBlock
                        title={this.props.title}
                        descr={this.props.descr}
                        subLessons={this.props.subLessons}
                        refs={this.props.refs}
                        books={this.props.books}
                        url={this.props.url}
                    />
                    <span className={"favorites" + (this._isLessonInBookmarks() ? ' active' : '')} onClick={::this._favoritesClick}>
                        <svg width="14" height="23" dangerouslySetInnerHTML={{__html: this._isLessonInBookmarks() ? _redFlag : _flag }}/>
                    </span>
                </div>
            </li>
        )
    }
}

class InfoBlock extends React.Component {
    render() {
        return (
            <div className="lecture-full__info-block">
                <div className="lecture-full__text-block">
                    <h3 className="lecture-full__title"><Link to={this.props.url}>{this.props.title}</Link></h3>
                    <p className="lecture-full__descr">{' ' + this.props.descr + ' '}</p>
                </div>
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
        getUserBookmarks: bindActionCreators(getUserBookmarks, dispatch),
        addLessonToBookmarks: bindActionCreators(addLessonToBookmarks, dispatch),
        removeLessonFromBookmarks: bindActionCreators(removeLessonFromBookmarks, dispatch),
        userActions: bindActionCreators(userActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LessonFull);