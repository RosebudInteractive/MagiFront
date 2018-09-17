import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import * as playerStartActions from '../../actions/player-start-actions'
import {bindActionCreators} from 'redux';
import $ from 'jquery'
import * as userActions from "../../actions/user-actions";
import {
    addLessonToBookmarks,
    userBookmarksSelector,
    getUserBookmarks,
    removeLessonFromBookmarks
} from "../../ducks/profile";

import {setScrollTop} from "../../containers/combined-lesson-page";

class LessonFrame extends React.Component {
    static propTypes = {
        courseUrl: PropTypes.string,
        lesson: PropTypes.object,
        isMain: PropTypes.bool,
    };

    static defaultProps = {
        isMain: true
    };

    constructor(props) {
        super(props)
        this._touchMoved = false;
        this._touchEventName = this.props.isMobileApp ? 'touchend' : 'mouseup'
    }

    componentDidMount() {
        let that = this,
            _player = $('.js-player');

        _player.on(this._touchEventName, (e) => {
            if (this._touchMoved) {
                return
            }

            let _isLessonScreen = e.target.closest('#lesson-' + that.props.lesson.Id),
                _isMenu = e.target.closest('.lectures-menu'),
                _isButtonTarget = e.target.closest('.lecture-frame__play-btn'),
                _isSocialBlock = e.target.closest('.social-block'),
                _isTranscriptLink = e.target.closest('.link-to-transcript'),
                _isPlayerBlock = e.target.closest('.player-frame'),
                _isFavoritesButton = e.target.closest('.lecture-frame__fav');

            if (_isLessonScreen && !_isButtonTarget && !_isSocialBlock && !_isPlayerBlock && !_isTranscriptLink && !_isMenu && !_isFavoritesButton) {
                that._play()
            }
        }).on('touchmove', () => {
            this._touchMoved = true;
        }).on('touchstart', () => {
            this._touchMoved = false;
        });
    }

    componentWillUnmount() {
        this._removeListeners();
    }

    _removeListeners() {
        $('.js-player').unbind(this._touchEventName);
        $('.js-player').unbind('touchmove');
        $('.js-player').unbind('touchstart');
    }

    _play() {
        setScrollTop($('body, html').scrollTop())
        this.props.playerStartActions.preinitAudios(this.props.audios);
        this.props.history.replace('/' + this.props.courseUrl + '/' + this.props.lesson.URL + '?play')
        // this.forceUpdate()
        this.props.playerStartActions.startPlay(this.props.lesson.Id)
    }

    _unlock() {
        this.props.userActions.showSignInForm();
    }

    _getButton(isFinished) {
        const _playLock = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#play-lock"/>',
            _replay = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#lecture-replay"/>';

        const _style = {cursor: 'pointer'};

        let {lesson, authorized} = this.props,
            _button = null;

        if (lesson.IsAuthRequired && !authorized) {
            _button = (
                <div style={_style} onClick={::this._unlock}>
                    <span className="play-btn-big lecture-frame__play-btn lock">
                        <svg width="102" height="90" dangerouslySetInnerHTML={{__html: _playLock}}/>
                        Воспроизвести
                    </span>
                </div>
            )
        } else {
            _button = (
                isFinished ?
                    (
                        <div style={_style} onClick={::this._play}>
                            <span className="play-btn-big lecture-frame__play-btn lock">
                                <svg width="102" height="90" dangerouslySetInnerHTML={{__html: _replay}}/>
                                Воспроизвести
                            </span>
                        </div>
                    )
                    :
                    (
                        <div style={_style} onClick={::this._play}>
                            <span className="play-btn-big lecture-frame__play-btn">Воспроизвести</span>
                        </div>
                    )

            )
        }

        return _button;
    }

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
        const _plus = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#plus"/>',
            _flag = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#flag-white"/>',
            _redFlag = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#flag-red"/>';

        let {lesson} = this.props;
        let _number = this.props.isMain ? (lesson.Number + '. ') : (lesson.Number + ' ');
        let _lessonInfo = this.props.lessonInfoStorage.lessons.get(lesson.Id),
            _currentTime = _lessonInfo ? _lessonInfo.currentTime : 0,
            _isFinished = _lessonInfo ? _lessonInfo.isFinished : false,
            _playPercent = lesson.Duration ? ((_currentTime * 100) / lesson.Duration) : 0,
            _inFavorites = this._isLessonInBookmarks();

        return [
            <button type="button" className="lecture-frame__fav" onClick={::this._favoritesClick}>
                <svg width="14" height="23" dangerouslySetInnerHTML={{__html: _inFavorites ? _redFlag : _flag}}/>
            </button>,
            <div className="lecture-frame" style={this.props.visible ? null : {display: 'none'}}>
                <div className="lecture-frame__header">
                    <div className="lecture-frame__play-link">
                        {this.props.isMain ? null :
                            <button type="button" className="lecture-frame__plus">
                                <span className="lecture-frame__plus-icon">
                                    <svg width="18" height="18" dangerouslySetInnerHTML={{__html: _plus}}/>
                                </span>
                                <span className="lecture-frame__plus-text">Доп. эпизод</span>
                            </button>}
                        <h2 className="lecture-frame__title">
                            <span className="lecture-frame__duration">{lesson.DurationFmt}</span>
                            {this._getButton(_isFinished)}
                            <p className="title-paragraph">
                                <span className="title-text">
                                    <span className="number">{_number}</span>
                                    {lesson.Name + '\n'}
                                </span>
                            </p>
                        </h2>
                        <div className="lecture-frame__text-block">
                            <p className="lecture-frame__descr">{lesson.ShortDescription}</p>
                            <p className="lecture-frame__author">{lesson.Author.FirstName + ' ' + lesson.Author.LastName}</p>
                        </div>
                    </div>
                    <SocialBlock/>
                </div>
                <div className="progress-bar">
                    <div className="progress-bar__bar" style={{width: _playPercent + '%'}}/>
                </div>
            </div>
        ]
    }
}

class SocialBlock extends React.Component {
    static propTypes = {
        inFavorites: PropTypes.bool,
        onFavoritesClick: PropTypes.func,
    }

    render() {
        const _tw = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#tw"/>',
            _fb = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#fb"/>',
            _vk = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#vk"/>',
            _ok = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#ok"/>';

        return (
            <div className="social-block">
                <a href="#" className="social-btn">
                    <div className="social-btn__icon">
                        <svg width="27" height="22" dangerouslySetInnerHTML={{__html: _tw}}/>
                    </div>
                    <span className="social-btn__actions"/>
                </a>
                <a href="#" className="social-btn _active">
                    <div className="social-btn__icon">
                        <svg width="24" height="24" dangerouslySetInnerHTML={{__html: _fb}}/>
                    </div>
                    <span className="social-btn__actions">64</span>
                </a>
                <a href="#" className="social-btn _active">
                    <div className="social-btn__icon">
                        <svg width="26" height="15" dangerouslySetInnerHTML={{__html: _vk}}/>
                    </div>
                    <span className="social-btn__actions">91</span>
                </a>
                <a href="#" className="social-btn _active">
                    <div className="social-btn__icon">
                        <svg width="14" height="24" dangerouslySetInnerHTML={{__html: _ok}}/>
                    </div>
                    <span className="social-btn__actions">4</span>
                </a>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        bookmarks: userBookmarksSelector(state),
        lessonInfoStorage: state.lessonInfoStorage,
        authorized: !!state.user.user,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        playerStartActions: bindActionCreators(playerStartActions, dispatch),
        userActions: bindActionCreators(userActions, dispatch),
        getUserBookmarks: bindActionCreators(getUserBookmarks, dispatch),
        addLessonToBookmarks: bindActionCreators(addLessonToBookmarks, dispatch),
        removeLessonFromBookmarks: bindActionCreators(removeLessonFromBookmarks, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LessonFrame);