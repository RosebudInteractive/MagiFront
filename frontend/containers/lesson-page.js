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

        this.state = {
            total: 0,
            currentActive: 0,
            isMobile: $(window).width() < 900,
            paused: true,
            redirectToPlayer: false,
        }

        this._internalRedirect = false;

        let that = this;
        this._handlePause = function () {
            that.setState({
                paused: this.audioState.stopped
            })
        }

        this._handlePlay = function () {
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
    }

    componentWillReceiveProps(nextProps) {
        let _lesson = this._getLessonInfo(nextProps.lessonInfo);
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
            this.setState({
                redirectToPlayer: true
            })
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

        if ((_needInitPlayer) && (_lesson)) {
            this.props.appActions.switchToFullPlayer();
            this._lessonId = _lesson.Id;
            this.props.lessonActions.getLessonPlayInfo(this._lessonId);
            this._needLoadPlayInfo = false;
            this._mountPlayerGuard = false;
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
            this._unmountFullpage()
        }
    }

    componentWillUnmount() {
        this._unmountFullpage();
        this._unmountMouseMoveHandler();
        this._unmountPlayerEvents();
        $('body').removeAttr('data-page');
    }

    _getLessonInfo(info) {
        if (!info.object) {
            return null
        }

        let _subLesson = info.object.Lessons;
        return !info.isSublesson ? info.object : (_subLesson[info.currentSubLesson])
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

        if ((!this._mountPlayerGuard) && (_container.length > 0) && (this.props.lessonPlayInfo.object) && (this.props.lessonInfo.object)) {

            let _options = {
                data: this.props.lessonPlayInfo.object,
                courseUrl: this.props.courseUrl,
                lesson: this._getLessonInfo(this.props.lessonInfo),
                div: _container,
                smallDiv: _smallContainer,
                onRenderContent: (content) => {
                    this.setState({currentContents: content})
                },
                onCurrentTimeChanged: (e) => {
                    this.setState({playTime: e})
                },
                onChangeContent: (e) => {
                    this.setState({content: e.id})
                },
                onAudioLoaded: (e) => {
                    if (e.paused) {
                        this._player.play()
                    }

                    this.setState({
                        muted: e.muted,
                        volume: e.volume,
                    })
                },
            };

            this._player = NestedPlayer(_options);

            this._player.addListener('pause', this._handlePause);
            this._player.addListener('play', this._handlePlay);

            let _state = this._player.audioState;
            this.setState({
                paused: _state.stopped,
                muted: _state.muted,
                volume: _state.volume,
                playTime: _state.currentTime,
                content: _state.currentContent,
            });

            this.props.lessonActions.clearLessonPlayInfo()
            getInstance().switchToFull();
            this._mountPlayerGuard = true;
        }
    }

    _unmountPlayerEvents() {
        if (this._player) {
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
                                               that.props.lessonActions.clearLessonPlayInfo()
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
                that._internalRedirect = true;
                let _newUrl = '/' + this.props.courseUrl + '/' + _anchors[nextIndex - 1].url;
                if ((that._player) && (that._player.lesson.Id === id)) {
                    _newUrl += '?play'
                }
                that.props.history.replace(_newUrl)

                if (getInstance() && (getInstance().lesson.Id !== id)) {
                    that._unmountPlayerEvents();
                    getInstance().switchToSmall();
                    that.props.appActions.switchToSmallPlayer();
                }
            },
            afterLoad: (anchorLink, index) => {
                let {id, number} = _anchors[index - 1];
                let _activeMenu = $('#lesson-menu-' + id);
                if (_activeMenu.length > 0) {
                    _activeMenu.show()
                }

                that._internalRedirect = false;
                this._activeLessonId = id;
                that.setState({currentActive: number})
            },
            afterRender: () => {
                let _url = this.props.lessonUrl;
                let _anchor = _anchors.find((anchor) => {
                    return anchor.url === _url
                })

                if (_anchor) {
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