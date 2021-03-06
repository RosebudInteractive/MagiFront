import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Redirect} from 'react-router';
import MetaTags from 'react-meta-tags';
import Menu from '../components/header-lesson-page'
import GalleryWrapper from "../components/transcript-page/gallery-slider-wrapper";
import MobileLessonWrapper from '../components/combined-lesson-page/mobile/mobile-lesson-wrapper';
import DesktopLessonWrapper from '../components/combined-lesson-page/desktop/desktop-lesson-wrapper';
import LessonInfo from '../components/combined-lesson-page/lesson-info';
import Transcript from '../components/combined-lesson-page/transcript';
import NotFoundPage from '../components/not-found';
import LoadingFrame from '../components/loading-frame';
import GalleryButtons from '../components/combined-lesson-page/gallery-button'

import * as lessonActions from '../actions/lesson-actions';
import * as pageHeaderActions from '../actions/page-header-actions';
import * as userActions from "../actions/user-actions";

import {getDomain, pages} from 'tools/page-tools';
import $ from 'jquery'
import * as storageActions from "../actions/lesson-info-storage-actions";
import * as appActions from "../actions/app-actions";
import * as playerStartActions from "../actions/player-start-actions";
import {isLandscape as isDesktopInLandscape} from '../components/combined-lesson-page/desktop/tools'

import '@fancyapps/fancybox/dist/jquery.fancybox.js';
import Sources from "../components/combined-lesson-page/sources";
import {userPaidCoursesSelector} from "ducks/profile";
import {facebookAppIdSelector, setCurrentPage, clearCurrentPage, notifyAnalyticsChangePage,} from "ducks/app";
import {notifyLessonShowed,} from "ducks/google-analytics";
import {getLessonsAll, loadingSelector as menuDataLoading} from "ducks/lesson-menu";
import ScrollMemoryStorage from "../tools/scroll-memory-storage";

import "../components/combined-lesson-page/lesson-page.sass"
import GallerySlider from "../components/combined-lesson-page/desktop/gallery-slider";
import browserHistory from "../history";

let _scrollTop = 0;

export const setScrollTop = (value) => {
    _scrollTop = value;
}

export const scroll = () => {
    if (_scrollTop > 0) {
        $('html, body').animate({
            scrollTop: _scrollTop
        }, 300);

        _scrollTop = 0;
    }
}

class CombineLessonPage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            redirectToPlayer: false,
        }

        this._resizeTimer = null;
        this._isDesktopLandscape = !this.props.isMobileApp && isDesktopInLandscape()

        this._handleScroll = () => {
            let _controls = $('.js-gallery-controls');

            if (_controls.length) {
                if ($('.js-player').length) {
                    if ($(window).scrollTop() < $('.js-player').outerHeight()) {
                        _controls.removeClass('visible');
                        _controls.fadeOut();
                    } else {
                        _controls.addClass('visible');
                        _controls.fadeIn();
                    }
                }
            }

            let st = $(window).scrollTop();

            if ($('.js-text-block-start').length) {

                let _blockStart = $('.js-text-block-start'),
                    _paddingBottom = _blockStart.css('padding-bottom')

                _paddingBottom = _paddingBottom.match(/px$/) ? +_paddingBottom.replace("px" , "") : 0

                if (st < _blockStart.offset().top + 148) {
                    $('.js-container').removeClass('_fixed');
                    $('.js-container').css('top', '0').css('bottom', 'auto');
                }

                if (st > _blockStart.offset().top + 48) {
                    $('.js-container').addClass('_fixed');
                    $('.left-block').removeClass('_ended');
                    $('.js-container').css('bottom', 'auto')
                }

                if (st > (_blockStart.offset().top + _blockStart.outerHeight() - ($('.js-container').outerHeight() + 78 + _paddingBottom) )) {
                    $('.js-container').removeClass('_fixed');
                    $('.left-block').addClass('_ended');
                    $('.js-container').css('bottom', '0');
                }

                if (st < _blockStart.offset().top - 69) {
                    $('.js-play').removeClass('_fixed');
                    $('.js-play').css('bottom', 'auto')
                }

                if (st > _blockStart.offset().top - 69) {
                    $('.js-play').addClass('_fixed');
                    $('.right-block').removeClass('_ended');
                    $('.js-play').css('bottom', 'auto')
                }

                if (st > (_blockStart.offset().top + _blockStart.outerHeight() - ($('.js-play').outerHeight() - 80 + _paddingBottom))) {
                    $('.js-play').removeClass('_fixed');
                    $('.right-block').addClass('_ended');

                    $('.js-play').css('bottom', '0')
                }
            }


            if ($('.js-player').length) {
                let _height = $('.js-player').outerHeight(),
                    _menu = $('.js-lectures-menu');

                _height = _menu.hasClass('desktop') ? _height - _menu.height() : _height;

                if (st > (_height + 63)) {
                    if (this.props.galleryIsOpen) {
                        _openGallerySlider()
                    }
                }

                if (st < $('.js-player').outerHeight()) {
                    closeGallerySlider();
                }
            }
        }

        this._resizeHandler = () => {
            $('body').addClass('resizing');

            let _isDesktopLandscape = !this.props.isMobileApp && isDesktopInLandscape()
            if (this._isDesktopLandscape !== _isDesktopLandscape) {
                this._isDesktopLandscape = _isDesktopLandscape
                this.forceUpdate()
            }

            clearTimeout(this._resizeTimer);
            this._resizeTimer = setTimeout(() => {
                $('body').removeClass('resizing');
            }, 500);
        }

        this._copyHandler = (e) => {
            const _courseName = this.props.course ? this.props.course.Name : "",
                _lesson = this._getLesson(),
                _lessonName = _lesson ? _lesson.Name : ""

            const _text = `\n\n${getDomain()}\n????????: "${_courseName}"\n????????????: "${_lessonName}"\n?????????????????? ???????????????? ???????????????????? ??????????????, ?????????????????????????? ?????????????? ???????????????????????? ?? ????????????????????????????????`;
            e.clipboardData.setData('text/plain', document.getSelection() + _text);
            e.preventDefault();
        }

        this._addEventListeners();
    }

    _addEventListeners() {
        window.addEventListener('scroll', this._handleScroll);
        window.addEventListener('resize', this._resizeHandler);
        document.addEventListener("copy", this._copyHandler)
    }

    _removeEventListeners() {
        window.removeEventListener('scroll', this._handleScroll);
        window.removeEventListener('resize', this._resizeHandler);
        document.removeEventListener("copy", this._copyHandler)
        $('body').removeClass('_player');
    }

    UNSAFE_componentWillMount() {
        window.scrollTo(0, 0)
        let {courseUrl, lessonUrl} = this.props;

        this.props.userActions.whoAmI();
        this.props.storageActions.refreshState();

        this.props.lessonActions.getLesson(courseUrl, lessonUrl);
        this.props.getLessonsAll(courseUrl, lessonUrl);
        this.props.lessonActions.getLessonText(courseUrl, lessonUrl);

        this.props.pageHeaderActions.setCurrentPage(pages.lesson, courseUrl, lessonUrl);

        this._needStartPlayer = this.props.params === '?play'
    }

    componentDidMount() {
        $('body').addClass('_player');
        $('[data-fancybox]').fancybox();
        this._handleScroll();
        this.props.setCurrentPage(this)
    }

    componentWillUnmount() {
        this._removeEventListeners();
        this.props.lessonActions.clearLesson();
        let _lesson = this._getLesson()
        if (_lesson) {
            this.props.playerStartActions.cancelStarting(_lesson.Id);
        }
        this._removeMetaTags();
        this.props.clearCurrentPage();
    }

    componentDidUpdate(prevProps) {
        let {lessonInfo, playInfo, courseUrl, lessonUrl, authorized,} = this.props;

        if ((courseUrl !== prevProps.courseUrl) || (lessonUrl !== prevProps.lessonUrl)) {
            this.props.lessonActions.getLesson(courseUrl, lessonUrl);
            this.props.appActions.hideLessonMenu()
        }


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
                if ((_lesson.IsAuthRequired && !authorized) || this._needLockLessonAsPaid(_lesson)) {
                    let _newUrl = '/' + courseUrl + '/' + lessonUrl;
                    this.props.history.replace(_newUrl)
                } else {
                    this.props.playerStartActions.startPlayLesson(_lesson)
                }
            }
        }

        if (_lesson) {
            document.title = `${_lesson.Name} ???????????? ????????????????, ?????????????? ?? ???????????? ????????????. ???????? ${_lesson.Course.Name}. ${_lesson.Author.FirstName} ${_lesson.Author.LastName} - ????????????????????`
        }


        if ((!prevProps.playingLesson && this.props.playingLesson) || (prevProps.playingLesson && this.props.playingLesson && prevProps.playingLesson.LessonId !== this.props.playingLesson.LessonId)) {
            scroll()
        }

        if (prevProps.fetching && !this.props.fetching) {
            const _key = this.props.location.key;
            ScrollMemoryStorage.scrollPage(_key)


            this.props.notifyLessonShowed({
                Id: this.props.course.Id,
                Name: this.props.course.Name,
                category: this.props.course.Categories[0].Name,
                author: this.props.lesson.Author.FirstName + ' ' + this.props.lesson.Author.LastName,
                lessonName: this.props.lesson.Name,
                price: this.props.course.IsPaid ? (this.props.course.DPrice ? this.props.course.DPrice : this.props.course.Price) : 0,
                IsBought: this.props.course.IsBought,
                IsGift: this.props.course.IsGift,
                URL: this.props.course.URL,
                image: this.props.course.MetaImages && this.props.course.MetaImages.og ? this.props.course.MetaImages.og.FileName : this.props.course.Cover
            })

            if (window.prerenderEnable) {_openGallerySlider()}

            this.props.notifyAnalyticsChangePage(this.props.ownProps.location.pathname)
        }
    }

    reload() {
        let {courseUrl, lessonUrl} = this.props;

        this.props.userActions.whoAmI();
        this.props.storageActions.refreshState();

        this.props.lessonActions.getLesson(courseUrl, lessonUrl);
        this.props.getLessonsAll(courseUrl, lessonUrl);
        this.props.lessonActions.getLessonText(courseUrl, lessonUrl);
    }

    _getLessonInfoByUrl(info, courseUrl, lessonUrl) {
        if (!info.object) {
            return null
        }

        return ((info.object.courseUrl === courseUrl) && (info.object.URL === lessonUrl)) ?
            info.object
            :
            info.object.Childs.find((lesson) => {
                return ((lesson.courseUrl === courseUrl) && (lesson.URL === lessonUrl))
            })
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if ((this.props.courseUrl !== nextProps.courseUrl) || (this.props.lessonUrl !== nextProps.lessonUrl)) {
            this.props.lessonActions.getLesson(nextProps.courseUrl, nextProps.lessonUrl);
            this.props.lessonActions.getLessonText(nextProps.courseUrl, nextProps.lessonUrl);

            let _lesson = this._getLesson()
            if (_lesson) {
                this.props.playerStartActions.cancelStarting(_lesson.Id);
            }
        }

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


        let _isRedirectFromThisPage = (nextState.redirectToPlayer) &&
            (this.props.courseUrl === nextProps.courseUrl) &&
            (this.props.lessonUrl !== nextProps.lessonUrl);

        let _needSkipRedirect = _linkToSelfLessonFromPlayer || _isRedirectFromThisPage

        if (_needSkipRedirect) {
            let _newUrl = '/' + nextProps.courseUrl + '/' + nextProps.lessonUrl + '?play';
            this.props.history.replace(_newUrl)
            this.props.appActions.hideLessonMenu()
        }

        return !_needSkipRedirect
    }

    render() {
        let {
            lesson,
            lessonText,
            fetching,
            authorized,
            isMobileApp,
            notFound,
            course,
        } = this.props;

        let _isNeedHideRefs = !lessonText || !lessonText.refs || !(lessonText.refs.length > 0),
            _lesson = lesson ? this._getLesson() : null,
            _isNeedHideGallery = !_lesson || (_lesson.IsAuthRequired && !authorized),
            _galleryHasItems = lessonText && lessonText.gallery && Array.isArray(lessonText.gallery) && (lessonText.gallery.length > 0)

        if ((this.state.redirectToPlayer) && (this.props.courseUrl) && (this.props.lessonUrl)) {
            browserHistory.push('/' + this.props.courseUrl + '/' + this.props.lessonUrl + '?play')
            return null
        }

        return (
            fetching ?
                <LoadingFrame/>
                :
                notFound ?
                    <NotFoundPage/>
                    :
                    (lesson && _lesson && lessonText.loaded) ?
                        <React.Fragment>
                            {this._getMetaTags()}
                            <Menu lesson={_lesson}
                                  isNeedHideRefs={_isNeedHideRefs}
                                  episodes={lessonText.episodes}
                                  active={_lesson.Id}
                                  extClass={!isMobileApp && isDesktopInLandscape() ? 'pushed' : ''}
                                  isPlayerMode={this._isPlayerMode(_lesson)}/>
                            {
                                _galleryHasItems &&
                                    <React.Fragment>
                                        <GalleryButtons isLocked={!authorized}/>
                                        {lessonText.loaded && <GalleryWrapper gallery={lessonText.gallery}/>}
                                        {lessonText.loaded && <GallerySlider/>}
                                    </React.Fragment>
                            }
                            {this._getLessonsBundles()}
                            <Sources lesson={_lesson}/>
                            <LessonInfo lesson={_lesson} course={course}/>
                            <Transcript current={{courseUrl: this.props.courseUrl, lessonUrl: this.props.lessonUrl}}
                                        course={course} lesson={_lesson}
                                        isNeedHideGallery={_isNeedHideGallery}
                                        isPaidCourse={this._isPaidCourse}/>
                        </React.Fragment>
                        :
                        null
        )
    }

    _isPlayerMode(lesson) {
        const {lessonUrl, playingLesson, lessonEnded, canNotPlay,} = this.props

        let _playingLessonUrl = (lesson.URL === lessonUrl) && (this.props.params === '?play'),
            _lessonInPlayer = (playingLesson && (lesson.URL === playingLesson.lessonUrl))

        return (_playingLessonUrl || _lessonInPlayer) && !(lessonEnded || canNotPlay)
    }

    _getLessonsBundles() {
        let lesson = this._getLesson();

        return lesson ? this._createBundle(lesson) : null;
    }

    _getLesson() {
        let {lessonUrl, lessonInfo} = this.props,
            lesson = lessonInfo.object;

        if (!lesson) {return null}

        let _lesson = (lesson.URL === lessonUrl) ? lesson : lesson.Childs.find((subLesson) => {
            return subLesson.URL === lessonUrl
        })

        if (_lesson) {
            let _hasSubLessons = _lesson.Childs && (_lesson.Childs.length > 0)
            if (_hasSubLessons) {
                _lesson.Childs.forEach(sublesson => {
                    if (!sublesson.Author) {
                        sublesson.Author = Object.assign({}, _lesson.Author)
                    }

                    if (!sublesson.Course) {
                        sublesson.Course = {}
                        sublesson.Course.Name = _lesson.Course.Name
                    }
                })
            }
        }

        return _lesson
    }

    _isMainLesson() {
        let {lessonUrl, lessonInfo} = this.props,
            lesson = lessonInfo.object;

        return lesson.URL === lessonUrl
    }

    _createBundle(lesson) {
        let {lessonText, lessonUrl, playingLesson, isMobileApp, lessonEnded, canNotPlay, course, } = this.props,
            _isNeedHideRefs = !lessonText || !lessonText.refs || !(lessonText.refs.length > 0);

        let _playingLessonUrl = (lesson.URL === lessonUrl) && (this.props.params === '?play'),
            _lessonInPlayer = (playingLesson && (lesson.URL === playingLesson.lessonUrl))

        let _audios = lesson.Audios;

        return (isMobileApp) ?
            <MobileLessonWrapper lesson={lesson}
                                 course={course}
                                 courseUrl={this.props.courseUrl}
                                 lessonUrl={lesson.URL}
                                 isPlayer={(_playingLessonUrl || _lessonInPlayer) && !(lessonEnded || canNotPlay)}
                                 audios={_audios}
                                 history={this.props.history}
                                 isMain={this._isMainLesson()}
                                 shareUrl={this._getShareUrl()}
                                 counter={lesson.ShareCounters}
                                 singleLesson={course.OneLesson}
                                 isPaidCourse={this._isPaidCourse}
                                 needLockLessonAsPaid={this._needLockLessonAsPaid(lesson)}
            />
            :
            <DesktopLessonWrapper lesson={lesson}
                                  course={course}
                                  isNeedHideRefs={_isNeedHideRefs}
                                  episodes={lessonText.episodes}
                                  active={lesson.Id}
                                  courseUrl={this.props.courseUrl}
                                  lessonUrl={lesson.URL}
                                  isPlayer={(_playingLessonUrl || _lessonInPlayer) && !(lessonEnded || canNotPlay)}
                                  audios={_audios}
                                  history={this.props.history}
                                  isMain={this._isMainLesson()}
                                  shareUrl={this._getShareUrl()}
                                  counter={lesson.ShareCounters}
                                  singleLesson={course.OneLesson}
                                  isPaidCourse={this._isPaidCourse}
                                  needLockLessonAsPaid={this._needLockLessonAsPaid(lesson)}
            />
    }

    _getShareUrl() {
        return window.location.protocol + '//' + window.location.host + window.location.pathname;
    }

    _getMetaTags() {
        let {lesson, facebookAppID} = this.props,
            _url = this._getShareUrl(),
            _domain = window.location.protocol + '//' + window.location.host,
            _imagePath = _domain + '/data/';

        let _getWidth = (meta) => {
            let _data = JSON.parse(meta);

            return _data ? _data.size.width : 0
        }

        let _getHeight = (meta) => {
            let _data = JSON.parse(meta);

            return _data ? _data.size.height : 0
        }

        this._removeRobotsMetaTags()

        return lesson
            ?
            <MetaTags>
                <meta name="description" content={lesson.PageMeta.Post ? lesson.PageMeta.Post : lesson.ShortDescription}/>
                <link rel="canonical" href={_url}/>
                <link rel="publisher" href="https://plus.google.com/111286891054263651937"/>
                <meta property="og:locale" content="ru_RU"/>
                <meta property="og:type" content="article"/>
                <meta property="og:title" content={lesson.PageMeta.Name}/>
                <meta property="og:description" content={lesson.PageMeta.Description}/>
                <meta property="og:url" content={_url}/>
                <meta property="og:site_name" content="????????????????????"/>
                {/*<meta property="article:publisher" content="https://www.facebook.com/Magisteria.ru/"/>*/}
                <meta property="article:section" content={lesson.Name}/>
                <meta property="article:published_time" content={lesson.ReadyDate}/>
                <meta property="article:modified_time" content={lesson.ReadyDate}/>
                <meta property="og:updated_time" content={lesson.ReadyDate}/>
                <meta property="fb:app_id" content={facebookAppID}/>
                {
                    lesson.PageMeta && lesson.PageMeta.Images && lesson.PageMeta.Images.og
                        ?
                        [
                            <meta property="og:image" content={_imagePath + lesson.PageMeta.Images.og.FileName}/>,
                            <meta property="og:image:secure_url"
                                  content={_imagePath + lesson.PageMeta.Images.og.FileName}/>,
                            <meta property="og:image:width" content={_getWidth(lesson.PageMeta.Images.og.MetaData)}/>,
                            <meta property="og:image:height" content={_getHeight(lesson.PageMeta.Images.og.MetaData)}/>
                        ]
                        :
                        null
                }
                <meta name="twitter:card" content="summary_large_image"/>
                <meta name="twitter:description" content={lesson.PageMeta.Description}/>
                <meta name="twitter:title" content={lesson.PageMeta.Name}/>
                <meta name="twitter:site" content="@MagisteriaRu"/>
                {
                    lesson.PageMeta && lesson.PageMeta.Images && lesson.PageMeta.Images.twitter
                        ?
                        <meta name="twitter:image" content={_imagePath + lesson.PageMeta.Images.twitter.FileName}/>
                        :
                        null
                }
                <meta name="twitter:creator" content="@MagisteriaRu"/>
                <meta name="apple-mobile-web-app-title" content="Magisteria"/>
                <meta name="application-name" content="Magisteria"/>
            </MetaTags>
            :
            null
    }

    _removeMetaTags() {
        $('meta[name="description"]').remove();
        $('link[rel="canonical"]').remove();
        $('link[rel="publisher"]').remove();
        $('meta[property="og:locale"]').remove();
        $('meta[property="og:type"]').remove();
        $('meta[property="og:title"]').remove();
        $('meta[property="og:description"]').remove();
        $('meta[property="og:url"]').remove();
        $('meta[property="og:site_name"]').remove();
        $('meta[property="article:publisher"]').remove();
        $('meta[property="article:section"]').remove();
        $('meta[property="article:published_time"]').remove();
        $('meta[property="article:modified_time"]').remove();
        $('meta[property="og:updated_time"]').remove();
        $('meta[property="fb:app_id"]').remove();
        $('meta[property="og:image"]').remove();
        $('meta[property="og:image:secure_url"]').remove();
        $('meta[property="og:image:width"]').remove();
        $('meta[property="og:image:height"]').remove();
        $('meta[name="twitter:card"]').remove();
        $('meta[name="twitter:description"]').remove();
        $('meta[name="twitter:title"]').remove();
        $('meta[name="twitter:site"]').remove();
        $('meta[name="twitter:image"]').remove();
        $('meta[name="twitter:creator"]').remove();
        $('meta[name="apple-mobile-web-app-title"]').remove();
        $('meta[name="application-name"]').remove();
        $('meta[name="robots"]').remove();
        $('meta[name="prerender-status-code"]').remove();
    }

    _removeRobotsMetaTags() {
        $('meta[name="robots"]').remove();
        $('meta[name="prerender-status-code"]').remove();
    }

    get _isPaidCourse() {
        let {course, userPaidCourses,} = this.props;

        return (course && course.IsPaid && !course.IsGift && !course.IsBought && !userPaidCourses.includes(course.Id))
    }

    _needLockLessonAsPaid(lesson) {
        return this._isPaidCourse && !(lesson.IsFreeInPaidCourse || this.props.isAdmin)
    }
}

function closeGallerySlider() {
    let controls = $('.js-gallery-controls'),
        wrap = $('.js-gallery-slider-wrapper'),
        stickyBlock = $('.js-sticky-block');

    controls.addClass('hide').removeClass('show');
    wrap.removeClass('show');
    stickyBlock.removeClass('slider-opened');
}

function _openGallerySlider() {
    let _controls = $('.js-gallery-controls'),
        _wrap = $('.js-gallery-slider-wrapper'),
        _stickyBlock = $('.js-sticky-block');

    _controls.removeClass('hide').addClass('show');
    _wrap.addClass('show');
    _stickyBlock.addClass('slider-opened');
}

function mapStateToProps(state, ownProps) {
    return {
        isMobileApp: state.app.isMobileApp,
        courseUrl: ownProps.match.params.courseUrl,
        lessonUrl: ownProps.match.params.lessonUrl,
        params: ownProps.location.search,

        lessonInfo: state.singleLesson,
        fetching: state.singleLesson.fetching ||
            state.lessonText.fetching ||
            menuDataLoading(state),

        lesson: state.singleLesson.object,
        notFound: state.singleLesson.notFound || state.lessonText.notFound,
        authors: state.singleLesson.authors,
        lessonText: state.lessonText,
        course: state.singleLesson.course,
        authorized: !!state.user.user,
        isAdmin: !!state.user.user && state.user.user.isAdmin,

        playInfo: state.lessonPlayInfo.playInfo,
        playingLesson: state.player.playingLesson,
        lessonEnded: state.player.ended,
        canNotPlay: state.player.canNotPlay,
        galleryIsOpen: state.app.galleryIsOpen,

        facebookAppID: facebookAppIdSelector(state),
        userPaidCourses: userPaidCoursesSelector(state),
        ownProps,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        lessonActions: bindActionCreators(lessonActions, dispatch),
        pageHeaderActions: bindActionCreators(pageHeaderActions, dispatch),
        userActions: bindActionCreators(userActions, dispatch),
        storageActions: bindActionCreators(storageActions, dispatch),
        appActions: bindActionCreators(appActions, dispatch),
        playerStartActions: bindActionCreators(playerStartActions, dispatch),
        setCurrentPage: bindActionCreators(setCurrentPage, dispatch),
        clearCurrentPage: bindActionCreators(clearCurrentPage, dispatch),
        notifyLessonShowed: bindActionCreators(notifyLessonShowed, dispatch),
        getLessonsAll: bindActionCreators(getLessonsAll, dispatch),
        notifyAnalyticsChangePage: bindActionCreators(notifyAnalyticsChangePage, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CombineLessonPage);
