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
            isMobile: $(window).width() < 900,
            redirectToPlayer: false,
        }

        // this._internalRedirect = false;
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
            this._mountMouseMoveHandler();
        });
    }

    componentWillReceiveProps(nextProps) {

        let _lesson = this._getLessonInfoByUrl(nextProps.lessonInfo, nextProps.courseUrl, nextProps.lessonUrl);

        let _needStartPlay = (nextProps.params === '?play')

        if (_lesson && _needStartPlay) {
            let _isPlayingLesson = nextProps.playInfo ? (nextProps.playInfo.id === _lesson.Id) : false;

            if (_isPlayingLesson) {
                this.props.appActions.switchToFullPlayer()
            } else {
                this.props.playerStartActions.startPlayLesson(_lesson)
            }
        }

        let _needRedirect = (this.props.playInfo) &&
            (this.props.playInfo.lessonUrl === nextProps.lessonUrl) &&
            (this.props.playInfo.courseUrl === nextProps.courseUrl) &&
            (this.props.params !== '?play') && (nextProps.params !== '?play')

        if (_needRedirect) {
            this.setState({
                redirectToPlayer: true
            })
        }

    }

    componentDidUpdate(prevProps) {
        let {lessonInfo} = this.props;
        this._mountFullpage();

        let _lesson = this._getLessonInfo(lessonInfo);
        if (!_lesson) {
            return
        }

        this.props.appActions.hideLessonMenu()
        // let _needStartPlay = (this.props.params === '?play')

        if (this._needStartPlayer ) {
            this._needStartPlayer = false;

            let _isPlayingLesson = this.props.playInfo ? (this.props.playInfo.id === _lesson.Id) : false;

            if (_isPlayingLesson) {
                this.props.appActions.switchToFullPlayer()
            } else {
                this.props.playerStartActions.startPlayLesson(_lesson)
            }

            // this.props.playerStartActions.startPlayLesson(_lesson)
        }

        if ((this.props.courseUrl !== prevProps.courseUrl) || (this.props.lessonUrl !== prevProps.lessonUrl)) {
            let _anchor = this._getAnchors().find((item) => {
                return item.url === this.props.lessonUrl
            })

            let _isRedirectFromThisPage = (this.props.courseUrl === prevProps.courseUrl) &&
                (this.props.lessonUrl !== prevProps.lessonUrl) &&
                (_anchor);

            if (!_isRedirectFromThisPage) {
                this.props.lessonActions.getLesson(this.props.courseUrl, this.props.lessonUrl);
                this._unmountFullpage();
            } else {
                $.fn.fullpage.moveTo(_anchor.name);
                this.props.appActions.hideLessonMenu()
            }
        }
    }

    componentWillUnmount() {
        this._unmountFullpage();
        this._unmountMouseMoveHandler();
        $('body').removeAttr('data-page');
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

    _mountMouseMoveHandler() {
        // let that = this;
        //
        // $(document).on('mousemove', () => {
        //     $('body').removeClass('fade');
        //     if (that._timer) {
        //         clearTimeout(that._timer);
        //     }
        //
        //     if (getInstance() && (that._activeLessonId === getInstance().lesson.Id)) {
        //         that._timer = setTimeout(function () {
        //             $('body').addClass('fade');
        //         }, 7000);
        //     } else {
        //         that._timer = null
        //     }
        // });
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

            return <Wrapper key={key}
                            lesson={lesson}
                            courseUrl={this.props.courseUrl}
                            lessonUrl={lesson.URL}
                            isMain={isMain}
                            active={this.state.currentActive}
                            isPlayer={true}
            />
        } else {
            return <Wrapper key={key}
                            lesson={lesson}
                            lessonUrl={this.props.lessonUrl}
                            courseUrl={this.props.courseUrl}
                            isMain={isMain}
                            active={this.state.currentActive}
                            isPlayer={false}
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
                    that.props.history.replace(_newUrl)
                }
            },
            afterLoad: (anchorLink, index) => {
                let {id, number} = _anchors[index - 1];
                let _activeMenu = $('#lesson-menu-' + id);
                if (_activeMenu.length > 0) {
                    _activeMenu.show()
                }

                // that._internalRedirect = false;
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
            this.setState({redirectToPlayer: false})
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