import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Redirect} from 'react-router';

import $ from 'jquery'

import * as lessonActions from '../actions/lesson-actions';
import * as pageHeaderActions from '../actions/page-header-actions';
import * as appActions from '../actions/app-actions';

import LectureWrapper from '../components/lesson-page/lesson-wrapper';
import NestedPlayer, {getInstance} from '../components/player/nested-player';

import {pages} from '../tools/page-tools';

class LessonPage extends React.Component {

    constructor(props) {
        super(props);
        this._mountFullPageGuard = false;
        this._playingObject = null;

        this.state = {
            total: 0,
            currentActive: 0,
            isMobile: $(window).width() < 900,
            paused: true,
            redirectToPlayer: false,
        }

        this._internalRedirect = false;
        this._mounted = false;

        let that = this;
        this._handlePause = function () {
            if (that._mounted)
                that.setState({
                    paused: this.audioState.stopped
                })
        }

        this._handlePlay = function () {
            if (that._mounted)
                that.setState({
                    paused: this.audioState.stopped
                })
        }
    }

    componentWillMount() {
        let {courseUrl, lessonUrl} = this.props;

        this.props.lessonActions.getLesson(courseUrl, lessonUrl);
        this.props.pageHeaderActions.setCurrentPage(pages.lesson);
        this._needLoadPlayInfo = this.props.params === '?play'
    }

    componentDidMount() {
        $(document).ready(() => {
            this._mountFullpage();
            this._mountMouseMoveHandler();
        });

        this._mounted = true;
    }

    componentWillReceiveProps(nextProps) {
        let _lesson = this._getLessonInfo(nextProps.lessonInfo);
        if (!_lesson)
            return

        let _player = getInstance();

        let _anchor = this._getAnchors().find((item) => {
            return item.url === nextProps.lessonUrl
        })

        let _isRedirectFromThisPage = (nextProps.params === '?play') &&
            (_player) && (_lesson) && (_player.lesson) &&
            (this.props.courseUrl === nextProps.courseUrl) &&
            (this.props.lessonUrl !== nextProps.lessonUrl) &&
            (_anchor);

        if ((_isRedirectFromThisPage) && (!this._internalRedirect)) {
            this._moveToPlayer = nextProps.params === '?play';
            $.fn.fullpage.moveTo(_anchor.name);
            getInstance().switchToFull()
            this.props.appActions.switchToFullPlayer();
            return
        }

        let _needRedirect = (_player) && (_lesson) && (_player.lesson) &&
            (_player.lesson.Id === _lesson.Id) &&
            (_player.lesson.URL === nextProps.lessonUrl) &&
            (nextProps.params !== '?play')

        if (_needRedirect) {
            if (this._silentMove) {
                this._silentMove = false
            } else {
                this.setState({
                    redirectToPlayer: true
                })
            }
        }


        let _lessonId = this._activeLessonId ? this._activeLessonId : _lesson.Id;
        let _needReloadPlayInfo = (
                (_player) &&
                (_player.lesson) &&
                (_player.lesson.Id !== _lessonId)
            ) &&
            nextProps.params === '?play';

        if (_needReloadPlayInfo) {
            if (!this.props.lessonPlayInfo.fetching && !nextProps.lessonPlayInfo.fetching) {
                this.props.lessonActions.getLessonPlayInfo(_lessonId);
                return
            }

            if (nextProps.lessonPlayInfo.loaded) {
                this.props.appActions.switchToFullPlayer()
                this._needLoadPlayInfo = false;
                this._mountPlayerGuard = false;
            }
        }

        if (!_player && _lesson) {
            this._lessonId = _lesson.Id;
            if (!this.props.lessonPlayInfo.fetching && !nextProps.lessonPlayInfo.fetching) {
                this.props.lessonActions.getLessonPlayInfo(this._activeLessonId ? this._activeLessonId : this._lessonId);
                return
            }
        }

        let _needInitPlayer = (this._needLoadPlayInfo) ||
            (
                (
                    (this.props.courseUrl !== nextProps.courseUrl) ||
                    (this.props.lessonUrl !== nextProps.lessonUrl) ||
                    (this.props.params !== nextProps.params)
                ) &&
                nextProps.params === '?play'
            )

        if ((_needInitPlayer || this._needLoadPlayInfo) && _player && nextProps.lessonPlayInfo.loaded) {
            this.props.appActions.switchToFullPlayer();
            if (!this._internalRedirect) {
                this._needLoadPlayInfo = false;
                this._mountPlayerGuard = false;
                this._reinitPlayer = nextProps.lessonPlayInfo.playing
            }
        }
    }

    shouldComponentUpdate() {
        let _needRender = !this._internalRedirect;
        this._internalRedirect = false;

        return _needRender;
    }

    componentDidUpdate(prevProps) {
        if ((this.props.courseUrl !== prevProps.courseUrl) || (this.props.lessonUrl !== prevProps.lessonUrl)) {
            this.props.lessonActions.getLesson(this.props.courseUrl, this.props.lessonUrl);
            this._unmountFullpage();
            if (this._player) {
                if (this.state.paused) {
                    // this.props.lessonActions.clearLessonPlayInfo()
                    this._player.stop()
                    this._needLoadPlayInfo = true;
                    this._mountPlayerGuard = false;
                } else {
                    this.props.appActions.switchToSmallPlayer()
                }
            }
        }
    }

    componentWillUnmount() {
        this._unmountFullpage();
        this._unmountMouseMoveHandler();
        this._unmountPlayerEvents();
        $('body').removeAttr('data-page');
        this._mounted = false;
    }

    _getLessonInfo(info) {
        if (!info.object) {
            return null
        }

        let _lesson;
        if (this._activeLessonId) {
            _lesson = info.object.Id === this._activeLessonId ?
                info.object
                :
                info.object.Lessons.find((lesson) => {
                    return lesson.Id === this._activeLessonId
                })
        }

        if (!_lesson) {
            let _subLesson = info.object.Lessons;
            _lesson = !info.isSublesson ? info.object : (_subLesson[info.currentSubLesson])
        }

        return _lesson
    }

    _mountFullpage() {
        let _container = $('#fullpage-lesson');
        if ((!this._mountFullPageGuard) && (_container.length > 0)) {
            $('body').attr('data-page', 'fullpage-lesson');
            const _options = this._getFullpageOptions();
            _container.fullpage(_options)
            this._mountFullPageGuard = true;
        }
    }

    _unmountFullpage() {
        if (this._mountFullPageGuard) {
            $.fn.fullpage.destroy(true)
            this._mountFullPageGuard = false
            let _menu = $('.js-lesson-menu');
            _menu.remove();
        }
    }

    _mountPlayer(id) {
        let _container = $('#player' + id),
            _smallContainer = $('#small-player')

        if ((!this._mountPlayerGuard) && (_container.length > 0) && (this.props.lessonPlayInfo.loaded || this._reinitPlayer) && (this.props.lessonInfo.object) && (this._mountFullPageGuard)) {


            let _options = {
                data: this._reinitPlayer ? this.props.lessonPlayInfo.playingObject : this.props.lessonPlayInfo.loadedObject,
                courseUrl: this.props.courseUrl,
                lesson: this._getLessonInfo(this.props.lessonInfo),
                div: _container,
                smallDiv: _smallContainer,
                onRenderContent: (content) => {
                    if (this._mounted)
                        this.setState({currentContents: content})
                },
                onCurrentTimeChanged: (e) => {
                    if (this._mounted) {
                        this.setState({playTime: e})
                    }
                },
                onChangeContent: (e) => {
                    if (this._mounted)
                        this.setState({content: e.id})
                },
                onAudioLoaded: (e) => {
                    if (e.paused) {
                        this._player.play()
                    }

                    if (this._mounted)
                        this.setState({
                            muted: e.muted,
                            volume: e.volume,
                        })
                },
                onChangeTitle: (value) => {
                    if (this._mounted)
                        this.setState({
                            title: value,
                        })
                }
            };

            this._player = NestedPlayer(_options);

            this._player.addListener('pause', this._handlePause);
            this._player.addListener('play', this._handlePlay);

            if (!this._reinitPlayer) {
                this.props.lessonActions.startLessonPlaying(this.props.lessonPlayInfo.loadedObject);
            }

            getInstance().switchToFull();
            this._mountPlayerGuard = true;

            let _state = this._player.audioState;
            if (this._mounted) {
                this.setState({
                    paused: _state.stopped,
                    muted: _state.muted,
                    volume: _state.volume,
                    playTime: _state.currentTime,
                    content: _state.currentContent,
                });
            }

            this._reinitPlayer = false;
        }
    }

    _unmountPlayerEvents() {
        if ((this._player) && (!this._internalRedirect)) {
            this._player.removeListener('pause', this._handlePause);
            this._player.removeListener('play', this._handlePlay)
        }
    }

    _mountMouseMoveHandler() {
        let that = this;

        $(document).on('mousemove', () => {
            $('body').removeClass('fade');
            if (that._timer) {
                clearTimeout(that._timer);
            }

            if ((!that.state.paused) && (getInstance()) && (that._activeLessonId === getInstance().lesson.Id)) {
                that._timer = setTimeout(function () {
                    $('body').addClass('fade');
                }, 7000);
            } else {
                that._timer = null
            }
        });
    }

    _unmountMouseMoveHandler() {
        $(document).off('mousemove');
        clearTimeout(this._timer);
    }

    _createBundle(lesson, key, isMain) {
        let {authors} = this.props.lessonInfo;

        lesson.Author = authors.find((author) => {
            return author.Id === lesson.AuthorId
        });

        if ((lesson.URL === this.props.lessonUrl) && (this.props.params === '?play')) {

            let that = this;
            return <LectureWrapper key={key}
                                   lesson={lesson}
                                   lessonUrl={lesson.URL}
                                   courseUrl={this.props.course.URL}
                                   courseTitle={this.props.course.Name}
                                   lessonCount={this.props.lessons.object.length}
                                   isMain={isMain}
                                   active={this.state.currentActive}
                                   content={this.state.currentContents}
                                   currentContent={this.state.content}
                                   onPause={() => {
                                       if (that._player) {
                                           that._player.pause()
                                       }
                                   }}
                                   onPlay={() => {
                                       if (that._player) {
                                           that._player.play()
                                       }
                                   }}
                                   onMute={() => {
                                       if (that._player) {
                                           that._player.mute()
                                           that.setState({
                                               muted: true
                                           })
                                       }
                                   }}
                                   onUnmute={() => {
                                       if (that._player) {
                                           that._player.unmute()
                                           that.setState({
                                               muted: false
                                           })
                                       }
                                   }}
                                   onSetVolume={(value) => {
                                       if (that._player) {
                                           that._player.setVolume(value)
                                           that.setState({
                                               volume: value
                                           })
                                       }
                                   }}
                                   onLeavePage={() => {
                                       if (that._player) {
                                           if (that.state.paused) {
                                               // that.props.lessonActions.clearLessonPlayInfo()
                                               that._player.stop()
                                           } else {
                                               that.props.appActions.switchToSmallPlayer()
                                           }
                                       }
                                   }}
                                   onGoToContent={(position) => {
                                       if (that._player) {
                                           that._player.setPosition(position)
                                       }
                                   }}
                                   onSetRate={(value) => {
                                       if (that._player) {
                                           that._player.setRate(value)
                                       }
                                   }}
                                   playTime={this.state.playTime}
                                   volume={this.state.volume}
                                   muted={this.state.muted}
                                   paused={this.state.paused}
                                   title={this.state.title}
                                   isPlayer={true}
            />
        } else {
            return <LectureWrapper key={key}
                                   lesson={lesson}
                                   lessonUrl={this.props.lessonUrl}
                                   courseUrl={this.props.course.URL}
                                   courseTitle={this.props.course.Name}
                                   lessonCount={this.props.lessons.object.length}
                                   isMain={isMain}
                                   active={this.state.currentActive}
            />
        }
    }

    _getLessonsBundles() {
        let {object: lesson} = this.props.lessonInfo;
        let _bundles = [];

        if (!lesson) return _bundles;

        _bundles.push(this._createBundle(lesson, 'lesson0', true));

        if (lesson.Lessons) {
            lesson.Lessons.forEach((lesson, index) => {
                _bundles.push(this._createBundle(lesson, 'lesson' + (index + 1), false))
            });
        }

        return _bundles.map((bundle) => {
            return bundle
        });
    }

    _getAnchors() {
        let {object: lesson} = this.props.lessonInfo;

        if (!lesson) {
            return []
        }

        let _anchors = [];
        _anchors.push({
            name: 'lesson0',
            title: lesson.Name,
            id: lesson.Id,
            number: lesson.Number,
            url: lesson.URL,
        });

        lesson.Lessons.forEach((lesson, index) => {
            _anchors.push({
                name: 'lesson' + (index + 1),
                title: lesson.Name,
                id: lesson.Id,
                number: lesson.Number,
                url: lesson.URL,
            })
        });

        return _anchors
    }

    _getFullpageOptions() {
        let that = this;
        let _anchors = this._getAnchors();


        return {
            normalScrollElements: '.lectures-list-wrapper',
            fixedElements: '.js-lesson-menu',
            anchors: _anchors.map((anchor) => {
                return anchor.name
            }),
            navigation: (!this.state.isMobile && (_anchors.length > 1)),
            navigationTooltips: _anchors.map((anchor) => {
                return anchor.title
            }),
            css3: true,
            autoScrolling: !this.state.isMobile,
            lockAnchors: true,
            keyboardScrolling: true,
            animateAnchor: true,
            sectionSelector: '.fullpage-section',
            slideSelector: '.fullpage-slide',
            lazyLoading: true,
            onLeave: (index, nextIndex,) => {
                $('.js-lesson-menu').hide();
                let {id, number} = _anchors[nextIndex - 1];
                let _activeMenu = $('#lesson-menu-' + id);
                if (_activeMenu.length > 0) {
                    _activeMenu.show()
                }
                that.setState({currentActive: number});
                that._activeLessonId = id;

                if (that.props.lessonUrl !== _anchors[nextIndex - 1].url) {
                    that._internalRedirect = true;
                    let _newUrl = '/' + that.props.courseUrl + '/' + _anchors[nextIndex - 1].url;
                    if (that._moveToPlayer || ((that._player) && (that._player.lesson.Id === id))) {
                        _newUrl += '?play';
                        that._moveToPlayer = false;
                    }
                    that.props.history.replace(_newUrl)

                    if (getInstance() && (getInstance().lesson.Id !== id)) {
                        // that._unmountPlayerEvents();
                        getInstance().switchToSmall();
                        that.props.appActions.switchToSmallPlayer();
                    }
                }
            },
            afterLoad: (anchorLink, index) => {
                let {id, number} = _anchors[index - 1];
                let _activeMenu = $('#lesson-menu-' + id);
                if (_activeMenu.length > 0) {
                    _activeMenu.show()
                }

                that._internalRedirect = false;
                that._activeLessonId = id;
                that.setState({currentActive: number})
            },
            afterRender: () => {
                let _url = this.props.lessonUrl;
                let _anchor = _anchors.find((anchor) => {
                    return anchor.url === _url
                })

                if (_anchor) {
                    that._silentMove = true;
                    $.fn.fullpage.silentMoveTo(_anchor.name);
                }
            }
        }
    }

    render() {
        let {
            lessonInfo,
            fetching
        } = this.props;

        if ((this.state.redirectToPlayer) && (this.props.courseUrl) && (this.props.lessonUrl)) {
            this.setState({redirectToPlayer: false})
            return <Redirect push to={'/' + this.props.courseUrl + '/' + this.props.lessonUrl + '?play'}/>;
        }

        if (lessonInfo.object) {
            this._mountFullpage();
            this._mountPlayer(this._getLessonInfo(lessonInfo).Id);
        }

        return (
            fetching ?
                <p>Загрузка...</p>
                :
                lessonInfo.object ?
                    <div>
                        <div className='fullpage-wrapper' id='fullpage-lesson'>
                            {this._getLessonsBundles()}
                        </div>

                    </div>
                    :
                    null
        )
    }
}

function mapStateToProps(state, ownProps) {
    return {
        courseUrl: ownProps.match.params.courseUrl,
        lessonUrl: ownProps.match.params.lessonUrl,
        fetching: state.singleLesson.fetching,
        lessonInfo: state.singleLesson,
        lessonPlayInfo: state.lessonPlayInfo,
        course: state.singleLesson.course,
        lessons: state.lessons,
        params: ownProps.location.search,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        lessonActions: bindActionCreators(lessonActions, dispatch),
        pageHeaderActions: bindActionCreators(pageHeaderActions, dispatch),
        appActions: bindActionCreators(appActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LessonPage);