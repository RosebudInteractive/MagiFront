import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import $ from 'jquery'
import 'fullpage.js'

import * as lessonActions from '../actions/lesson-actions';
import * as pageHeaderActions from '../actions/page-header-actions';
import * as appActions from '../actions/app-actions';

import PlayerWrapper from '../components/player/wrapper'
import NestedPlayer, {getInstance} from '../components/player/nested-player';

import {pages} from '../tools/page-tools';

class Player extends React.Component {

    constructor(props) {
        super(props);
        this._mountFullPageGuard = false;

        this.state = {
            total: 0,
            current: 0,
            currentContents: [],
            playTime: 0,
            content: 0,
            paused: false,
            muted: false,
            volume: 0,
            isMobile: $(window).width() < 900
        }

        this._lessonId = 0;
        this._timer = null;
        this._activeLessonId = 0;
    }

    componentWillMount() {
        this.props.appActions.switchToFullPlayer();
        let {courseUrl, lessonUrl} = this.props;

        this.props.lessonActions.getLesson(courseUrl, lessonUrl);
        this.props.pageHeaderActions.setCurrentPage(pages.player);
    }

    componentWillUnmount() {
        this._unmountFullpage();
        this._unmountMouseMoveHandler();
        $('body').removeAttr('data-page');
        if (this._player) {
            // this._player.off('play');
            // this._player.off('pause');
        }
    }

    componentDidUpdate(prevProps) {
        if ((this.props.courseUrl !== prevProps.courseUrl) || (this.props.lessonUrl !== prevProps.lessonUrl)) {
            this.props.lessonActions.getLesson(this.props.courseUrl, this.props.lessonUrl);
            this._unmountFullpage()
        }
    }

    _mountFullpage() {
        // if (($(window).width() > 900)) {
            let _container = $('#fullpage-player');
            if ((!this._mountFullPageGuard) && (_container.length > 0)) {
                $('body').attr('data-page', 'fullpage-player');
                const _options = this._getFullpageOptions();
                _container.fullpage(_options)
                this._mountFullPageGuard = true;
            }
        // }
    }

    _unmountFullpage() {
        if (this._mountFullPageGuard) {
            $.fn.fullpage.destroy(true)
            this._mountFullPageGuard = false
            let _menu = $('.js-player-menu');
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
                    this._player.play();

                    this.setState({
                        // paused: false,
                        muted: e.muted,
                        volume: e.volume,
                    })
                },
                onPaused: () => {
                    this.setState({
                        paused: true
                    })
                },
            };

            let _isNewPlayer = !getInstance();

            this._player = NestedPlayer(_options);

            if (_isNewPlayer) {
                this._player.on('pause', () => {
                    this.setState({
                        paused: true
                    })
                });

                this._player.on('play', () => {
                    this.setState({
                        paused: false
                    })
                });
            }

            let _state = this._player.audioState;
            this.setState({
                paused: _state.stopped,
                muted: _state.muted,
                volume: _state.volume,
                playTime: _state.currentTime,
                content: _state.currentContent,
            });

            getInstance().switchToFull();
            this._mountPlayerGuard = true;
        }
    }

    componentDidMount() {
        $(document).ready(() => {
            this._mountFullpage();
            this._mountMouseMoveHandler();
        });
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

    _getLessonInfo(info) {
        if (!info.object) {
            return null
        }

        let _subLesson = info.object.Lessons;
        return !info.isSublesson ? info.object : (_subLesson[info.currentSubLesson])
    }

    componentWillReceiveProps(nextProps) {
        if ((this.props.courseUrl !== nextProps.courseUrl) || (this.props.lessonUrl !== nextProps.lessonUrl)) {
            this.props.lessonActions.getLesson(nextProps.courseUrl, nextProps.lessonUrl);
        }

        let _lesson = this._getLessonInfo(nextProps.lessonInfo);
        if ((_lesson) && (_lesson.Id !== this._lessonId)) {
            this.props.appActions.switchToFullPlayer();
            this._lessonId = _lesson.Id;
            this.props.lessonActions.getLessonPlayInfo(this._lessonId);
            this._mountPlayerGuard = false;
        }
    }

    _createBundle(lesson, key, isMain) {
        let {authors} = this.props.lessonInfo;
        let _history = this.props.history;

        lesson.Author = authors.find((author) => {
            return author.Id === lesson.AuthorId
        });

        let _activeLesson = this._getLessonInfo(this.props.lessonInfo),
            _isActiveLesson = _activeLesson ? (_activeLesson.Id === lesson.Id) : false;
        let that = this;
        return _isActiveLesson ?
            <PlayerWrapper key={key}
                           lesson={lesson}
                           lessonUrl={lesson.URL}
                           courseUrl={this.props.course.URL}
                           courseTitle={this.props.course.Name}
                           lessonCount={this.props.lessons.object.length}
                           isMain={isMain}
                           active={this.state.currentActive}
                           content={this.state.currentContents}
                           currentContent={this.state.content}
                           onPause={::this._handlePause}
                           onPlay={::this._handlePlay}
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
                                   that.props.appActions.switchToSmallPlayer()
                               }
                           }}
                           onGoToContent={::this._handleGoToContent}
                           onSetRate={::this._handleSetRate}
                           playTime={this.state.playTime}
                           volume={this.state.volume}
                           muted={this.state.muted}
                           paused={this.state.paused}
                           showCover={false}
            />
            :
            <PlayerWrapper key={key}
                           lesson={lesson}
                           lessonUrl={lesson.URL}
                           courseUrl={this.props.course.URL}
                           courseTitle={this.props.course.Name}
                           lessonCount={this.props.lessons.object.length}
                           isMain={isMain}
                           active={this.state.currentActive}
                           playTime={0}
                           volume={0}
                           muted={false}
                           paused={true}
                           onPlay={() => {
                               _history.push('/play-lesson/' + this.props.courseUrl + '/' + lesson.URL)
                           }}
                           showCover={true}
            />
    }

    _handlePause() {
        if (this._player) {
            this._player.pause()
            this.setState({
                paused: true
            })
        }
    }

    _handlePlay() {
        if (this._player) {
            this._player.play()
            this.setState({
                paused: false
            })
        }
        getInstance().switchToFull();
        this.props.appActions.switchToFullPlayer()
    }

    _handleSetRate(value) {
        if (this._player) {
            this._player.setRate(value)
        }
    }

    _handleGoToContent(position) {
        if (this._player) {
            this._player.setPosition(position)
        }
    }

    _getBundles() {
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
        let _anchors = this._getAnchors();


        return {
            normalScrollElements: '.lectures-list-wrapper',
            fixedElements: '.js-player-menu',
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
                $('.js-player-menu').hide();
                let {id, number} = _anchors[nextIndex - 1];
                let _activeMenu = $('#lesson-menu-' + id);
                if (_activeMenu.length > 0) {
                    _activeMenu.show()
                }
                this.setState({currentActive: number})

                this._activeLessonId = id;
                if (getInstance()) {
                    if (getInstance().lesson.Id === id) {
                        getInstance().switchToFull()
                        this.props.appActions.switchToFullPlayer();
                    } else {
                        getInstance().switchToSmall()
                        this.props.appActions.switchToSmallPlayer();
                    }
                }
            },
            afterLoad: (anchorLink, index) => {
                let {id, number} = _anchors[index - 1];
                let _activeMenu = $('#lesson-menu-' + id);
                if (_activeMenu.length > 0) {
                    _activeMenu.show()
                }
                this.setState({currentActive: number})
                this._activeLessonId = id;
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

        if (lessonInfo.object) {
            this._mountFullpage();
            this._mountPlayer(this._getLessonInfo(lessonInfo).Id);
        }

        return (
            fetching ?
                <p>Загрузка...</p>
                :
                lessonInfo.object ?
                    <div className='fullpage-wrapper' id='fullpage-player'>
                        {this._getBundles()}
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
    }
}

function mapDispatchToProps(dispatch) {
    return {
        lessonActions: bindActionCreators(lessonActions, dispatch),
        pageHeaderActions: bindActionCreators(pageHeaderActions, dispatch),
        appActions: bindActionCreators(appActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Player);