import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Redirect} from 'react-router';

import $ from 'jquery'
import 'fullpage.js'

import * as lessonActions from '../actions/lesson-actions';
import * as playerStartActions from '../actions/player-start-actions';
import * as pageHeaderActions from '../actions/page-header-actions';
import * as appActions from '../actions/app-actions';

import Wrapper from '../components/lesson-page/lesson-wrapper';

import {pages} from '../tools/page-tools';

class LessonPage extends React.Component {

    constructor(props) {
        super(props);
        this._mountFullPageGuard = false;

        this.state = {
            total: 0,
            currentActive: 0,
            redirectToPlayer: false,
        }

        this._internalRedirect = false;
        this._mountPlayerGuard = true;
    }

    componentWillMount() {
        let {courseUrl, lessonUrl} = this.props;

        this.props.lessonActions.getLesson(courseUrl, lessonUrl);
        this.props.lessonActions.getLessonsAll(courseUrl, lessonUrl);
        this.props.pageHeaderActions.setCurrentPage(pages.lesson);
        this._needStartPlayer = this.props.params === '?play'
    }

    componentDidMount() {
        $(document).ready(() => {
            this._mountFullpage();
        });

        this._mountKeydownHandler();
    }

    componentWillReceiveProps(nextProps) {

        if (this.state.redirectToPlayer) {
            this.setState({redirectToPlayer: false})
        }

        let _needRedirect = (this.props.playInfo) &&
            (this.props.playInfo.lessonUrl === nextProps.lessonUrl) &&
            (this.props.playInfo.courseUrl === nextProps.courseUrl) &&
            (nextProps.params !== '?play')

        if (_needRedirect) {
            this.setState({
                redirectToPlayer: true
            })
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        let _linkToSelfLessonFromPlayer = (nextState.redirectToPlayer) &&
            (this.props.courseUrl === nextProps.courseUrl) &&
            (this.props.lessonUrl === nextProps.lessonUrl) &&
            (this.props.params === '?play')


        let _anchors = this._getAnchors();

        let _index = _anchors.findIndex((item) => {
            return item.url === nextProps.lessonUrl
        });

        let _anchor = (_index >= 0) ? _anchors[_index] : null

        let _isRedirectFromThisPage = (nextState.redirectToPlayer) &&
            (this.props.courseUrl === nextProps.courseUrl) &&
            (this.props.lessonUrl !== nextProps.lessonUrl) &&
            (_anchor) && !this._internalRedirect;

        let _needSkipRedirect = _linkToSelfLessonFromPlayer || _isRedirectFromThisPage

        if (_needSkipRedirect) {
            let _newUrl = '/' + nextProps.courseUrl + '/' + nextProps.lessonUrl + '?play';
            this.props.history.replace(_newUrl)
            this.props.appActions.hideLessonMenu()
            if (_isRedirectFromThisPage) {
                $.fn.fullpage.moveTo(_anchor.name, _index + 1)
            }
        }

        return !_needSkipRedirect
    }

    componentDidUpdate(prevProps) {
        let {lessonInfo, playInfo, courseUrl, lessonUrl} = this.props;
        this._mountFullpage();

        if ((courseUrl !== prevProps.courseUrl) || (lessonUrl !== prevProps.lessonUrl)) {
            let _anchors = this._getAnchors();

            let _index = _anchors.findIndex((item) => {
                return item.url === lessonUrl
            })

            let _anchor = (_index >= 0) ? _anchors[_index] : null

            let _isRedirectFromThisPage = (courseUrl === prevProps.courseUrl) &&
                (lessonUrl !== prevProps.lessonUrl) &&
                (_anchor);

            if (!_isRedirectFromThisPage) {
                this.props.lessonActions.getLesson(courseUrl, lessonUrl);
                this._unmountFullpage();
            } else {
                if (!this._internalRedirect) {
                    $.fn.fullpage.moveTo(_anchor.name, _index + 1)
                }
            }
        }

        this.props.appActions.hideLessonMenu()

        let _lesson = this._getLessonInfoByUrl(lessonInfo, courseUrl, lessonUrl);
        if (!_lesson) {
            return
        }

        let _needStartPlay = (this.props.params === '?play')

        if (this._needStartPlayer || _needStartPlay) {
            this._needStartPlayer = false;

            let _isPlayingLesson = playInfo ? (playInfo.id === _lesson.Id) : false;

            if (_isPlayingLesson) {
                this.props.appActions.switchToFullPlayer()
            } else {
                this.props.playerStartActions.startPlayLesson(_lesson)
            }
        }

        if (_lesson) {
            document.title = 'Лекция: ' + _lesson.Name + ' - Магистерия'
        }
    }


    componentWillUnmount() {
        this._unmountFullpage();
        $('body').removeAttr('data-page');
        this.props.lessonActions.clearLesson();
    }

    _getLessonInfoByUrl(info, courseUrl, lessonUrl) {
        if (!info.object) {
            return null
        }

        return ((info.object.courseUrl === courseUrl) && (info.object.URL === lessonUrl)) ?
            info.object
            :
            info.object.Lessons.find((lesson) => {
                return ((lesson.courseUrl === courseUrl) && (lesson.URL === lessonUrl))
            })
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

    _mountKeydownHandler() {
        $(window).keydown((e) => {
            if (e.which === 32) {
                this._handleWhitespace = true;
                e.preventDefault();
            }
        })
    }

    _createBundle(lesson, key, isMain) {
        let {authors} = this.props.lessonInfo;

        lesson.Author = authors.find((author) => {
            return author.Id === lesson.AuthorId
        });


        let _playingLessonUrl = (lesson.URL === this.props.lessonUrl) && (this.props.params === '?play'),
            _isManyLessonsOnPage = this._getAnchors().length > 0,
            _lessonInPlayer = (this.props.playingLesson && (lesson.URL === this.props.playingLesson.lessonUrl))

        let _lessonAudios = this.props.lessons.object.find((item) => {
            return item.Id == lesson.Id
        })

        let _audios = _lessonAudios ? _lessonAudios.Audios : null;

        if (_playingLessonUrl || (_lessonInPlayer && _isManyLessonsOnPage)) {
            return <Wrapper key={key}
                            lesson={lesson}
                            courseUrl={this.props.courseUrl}
                            lessonUrl={lesson.URL}
                            isMain={isMain}
                            active={this.state.currentActive}
                            isPlayer={true}
                            audios={_audios}
                            history={this.props.history}
            />
        } else {
            return <Wrapper key={key}
                            lesson={lesson}
                            lessonUrl={this.props.lessonUrl}
                            courseUrl={this.props.courseUrl}
                            isMain={isMain}
                            active={this.state.currentActive}
                            isPlayer={false}
                            audios={_audios}
                            history={this.props.history}
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
            normalScrollElements: '.lectures-list-wrapper, .contents-tooltip',
            fixedElements: '.js-lesson-menu',
            anchors: _anchors.map((anchor) => {
                return anchor.name
            }),
            navigation: (!this.props.isMobileApp && (_anchors.length > 1)),
            navigationTooltips: _anchors.map((anchor) => {
                return anchor.title
            }),
            css3: true,
            autoScrolling: !this.props.isMobileApp,
            lockAnchors: true,
            keyboardScrolling: true,
            animateAnchor: true,
            sectionSelector: '.fullpage-section',
            slideSelector: '.fullpage-slide',
            lazyLoading: true,
            onLeave: (index, nextIndex,) => {
                if (that._handleWhitespace) {
                    that._handleWhitespace = false;
                    return false
                }

                if (index === nextIndex) {
                    return
                }

                let _menu = $('.js-lesson-menu');
                if (_menu.length) {
                    _menu.hide();
                }

                let {id} = _anchors[nextIndex - 1];
                let _activeMenu = $('#lesson-menu-' + id);
                if (_activeMenu.length > 0) {
                    _activeMenu.show()
                }
                that._activeLessonId = id;

                if (that.props.lessonUrl !== _anchors[nextIndex - 1].url) {
                    let _newUrl = '/' + that.props.courseUrl + '/' + _anchors[nextIndex - 1].url;
                    if (that.props.playInfo && (that.props.playInfo.id === id)) {
                        _newUrl += '?play';
                    }
                    that._internalRedirect = true;
                    that.props.history.replace(_newUrl)
                }
            },
            afterLoad: (anchorLink, index) => {
                that._internalRedirect = false;

                if (!index) {
                    return
                }

                let {id, number} = _anchors[index - 1];
                let _activeMenu = $('#lesson-menu-' + id);
                if (_activeMenu.length > 0) {
                    _activeMenu.show()
                }

                that._activeLessonId = id;
                that.setState({currentActive: number})
            },
            afterRender: () => {
                let _url = this.props.lessonUrl;
                let _anchor = _anchors.find((anchor) => {
                    return anchor.url === _url
                })

                if ((_anchors.length > 1) && _anchor) {
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
            // this.setState({redirectToPlayer: false})
            return <Redirect push to={'/' + this.props.courseUrl + '/' + this.props.lessonUrl + '?play'}/>;
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
        params: ownProps.location.search,

        fetching: state.singleLesson.fetching,
        lessonInfo: state.singleLesson,
        playInfo: state.lessonPlayInfo.playInfo,
        course: state.singleLesson.course,
        lessons: state.lessons,
        playingLesson: state.player.playingLesson,
        isMobileApp: state.app.isMobileApp,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        lessonActions: bindActionCreators(lessonActions, dispatch),
        playerStartActions: bindActionCreators(playerStartActions, dispatch),
        pageHeaderActions: bindActionCreators(pageHeaderActions, dispatch),
        appActions: bindActionCreators(appActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LessonPage);