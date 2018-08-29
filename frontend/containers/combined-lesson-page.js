import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Redirect} from 'react-router';

import Menu from '../components/combined-lesson-page/menu'
import GalleryWrapper from "../components/transcript-page/gallery-slider-wrapper";
import MobileLessonWrapper from '../components/combined-lesson-page/mobile-lesson-wrapper';
import DesktopLessonWrapper from '../components/combined-lesson-page/desktop-lesson-wrapper';
import LessonInfo from '../components/combined-lesson-page/lesson-info';
import TranscriptPage from '../components/combined-lesson-page/transcript-page';

import * as lessonActions from '../actions/lesson-actions';
import * as pageHeaderActions from '../actions/page-header-actions';
import * as userActions from "../actions/user-actions";

import {pages} from '../tools/page-tools';
import $ from 'jquery'
import * as storageActions from "../actions/lesson-info-storage-actions";
import * as appActions from "../actions/app-actions";
import * as playerStartActions from "../actions/player-start-actions";

import '@fancyapps/fancybox/dist/jquery.fancybox.js';
import Platform from "platform";

class TranscriptLessonPage extends React.Component {
    constructor(props) {
        super(props);
        this._isMobile = (Platform.os.family === "Android") || (Platform.os.family === "iOS") || (Platform.os.family === "Windows Phone")

        this.state = {
            redirectToPlayer: false,
        }

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

            if ($('.js-social-start').length) {

                let _socialStart = $('.js-social-start');

                if (st < _socialStart.offset().top + 147) {
                    $('.js-social').removeClass('_fixed');
                    $('.js-social').css('top', '0').css('bottom', 'auto');
                }

                if (st > _socialStart.offset().top + 147) {
                    $('.js-social').addClass('_fixed');
                    $('.js-social').css('bottom', 'auto').css('top', '0');
                }

                if (st > (_socialStart.offset().top + _socialStart.outerHeight() - $('.js-social').outerHeight())) {
                    $('.js-social').removeClass('_fixed');
                    $('.js-social').css('top', 'auto').css('bottom', '0');
                }

                if (st < _socialStart.offset().top - 63) {
                    $('.js-play').removeClass('_fixed');
                    $('.js-play').css('bottom', 'auto').css('top', '10px');
                }

                if (st > _socialStart.offset().top - 63) {
                    $('.js-play').addClass('_fixed');
                    $('.js-play').css('bottom', 'auto').css('top', '10px');
                }

                if (st > (_socialStart.offset().top + _socialStart.outerHeight() - $('.js-play').outerHeight() - 98)) {
                    $('.js-play').removeClass('_fixed');
                    $('.js-play').css('bottom', '0').css('top', 'auto');
                }
            }


            if ($('.js-player').length) {
                if (st > ($('.js-player').outerHeight() - 53)) {
                    $('.js-lectures-menu').removeClass('_dark');
                    $('.js-lectures-menu').addClass('_fixed');
                    this.props.playerStartActions.startPause()
                } else {
                    $('.js-lectures-menu').addClass('_dark');
                    $('.js-lectures-menu').removeClass('_fixed');
                }

                if (st < $('.js-player').outerHeight()) {
                    closeGallerySlider();
                }
            }
        }
    }

    componentWillMount() {
        let {courseUrl, lessonUrl} = this.props;

        this.props.userActions.whoAmI();
        this.props.storageActions.refreshState();

        this.props.lessonActions.getLesson(courseUrl, lessonUrl);
        this.props.lessonActions.getLessonsAll(courseUrl, lessonUrl);
        this.props.lessonActions.getLessonText(courseUrl, lessonUrl);

        this.props.pageHeaderActions.setCurrentPage(pages.lesson, courseUrl, lessonUrl);

        this._needStartPlayer = this.props.params === '?play'
    }

    componentDidMount() {
        window.addEventListener('scroll', this._handleScroll);
        // if (this._isMobile) {
            $('body').toggleClass('_player');
        // }
        $('[data-fancybox]').fancybox();
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this._handleScroll);
        this.props.lessonActions.clearLesson();
        // if (this._isMobile) {
            $('body').removeClass('_player');
        // }
    }

    componentDidUpdate(prevProps) {
        let {lessonInfo, playInfo, courseUrl, lessonUrl, authorized} = this.props;

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
                if (_lesson.IsAuthRequired && !authorized) {
                    let _newUrl = '/' + courseUrl + '/' + lessonUrl;
                    this.props.history.replace(_newUrl)
                } else {
                    this.props.playerStartActions.startPlayLesson(_lesson)
                }
            }
        }

        if (_lesson) {
            document.title = 'Лекция: ' + _lesson.Name + ' - Магистерия'
        }
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

    componentWillReceiveProps(nextProps) {
        if ((this.props.courseUrl !== nextProps.courseUrl) || (this.props.lessonUrl !== nextProps.lessonUrl)) {
            this.props.lessonActions.getLesson(nextProps.courseUrl, nextProps.lessonUrl);
            this.props.lessonActions.getLessonText(nextProps.courseUrl, nextProps.lessonUrl);
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

    _getLessonsBundles() {
        let lesson = this._getLesson();

        return lesson ? this._createBundle(lesson) : null;
    }

    _getLesson() {
        let {lessonUrl, lessonInfo} = this.props,
            lesson = lessonInfo.object;

        let _lesson = (lesson.URL === lessonUrl) ? lesson : lesson.Lessons.find((subLesson) => {
            return subLesson.URL === lessonUrl
        })

        if (_lesson) {
            let _audios = this._getAudios(_lesson)
            _lesson.Audios = Object.assign({}, _audios)

            let _hasSubLessons = _lesson.Lessons && (_lesson.Lessons.length > 0)
            if (_hasSubLessons) {
                _lesson.Lessons.forEach(sublesson => {
                    let _audios = this._getAudios(sublesson)
                    sublesson.Audios = Object.assign({}, _audios)
                })
            }
        }

        return _lesson
    }

    _getAudios(lesson) {
        let {lessons} = this.props,
            _lessonAudios = null;

        lessons.object.some((item) => {
            let _founded = item.Id === lesson.Id

            if (!_founded) {
                if (item.Lessons.length > 0) {
                    return item.Lessons.some((subItem) => {
                        if (subItem.Id === lesson.Id) {
                            _lessonAudios = subItem;
                        }
                        return subItem.Id === lesson.Id
                    })
                } else {
                    return false
                }
            } else {
                _lessonAudios = item;
                return true
            }
        })

        return _lessonAudios ? _lessonAudios.Audios : null;
    }

    _createBundle(lesson) {
        let {authors} = this.props.lessonInfo;

        lesson.Author = authors.find((author) => {
            return author.Id === lesson.AuthorId
        });


        let _playingLessonUrl = (lesson.URL === this.props.lessonUrl) && (this.props.params === '?play'),
            _lessonInPlayer = (this.props.playingLesson && (lesson.URL === this.props.playingLesson.lessonUrl))

        let _audios = this._getAudios(lesson);

        return this._isMobile ?
            <MobileLessonWrapper lesson={lesson}
                                 courseUrl={this.props.courseUrl}
                                 lessonUrl={lesson.URL}
                                 isPlayer={_playingLessonUrl || _lessonInPlayer}
                                 audios={_audios}
                                 history={this.props.history}
            /> :
            <DesktopLessonWrapper lesson={lesson}
                                  courseUrl={this.props.courseUrl}
                                  lessonUrl={lesson.URL}
                                  isPlayer={_playingLessonUrl || _lessonInPlayer}
                                  audios={_audios}
                                  history={this.props.history}
            />
    }

    render() {
        let {
            lesson,
            lessonText,
            fetching,
            authorized
        } = this.props;

        let _isNeedHideRefs = !lessonText || !lessonText.refs || !(lessonText.refs.length > 0),
            _lesson = lesson ? this._getLesson() : null,
            _isNeedHideGallery = !_lesson || (_lesson.IsAuthRequired && !authorized);

        if ((this.state.redirectToPlayer) && (this.props.courseUrl) && (this.props.lessonUrl)) {
            return <Redirect push to={'/' + this.props.courseUrl + '/' + this.props.lessonUrl + '?play'}/>;
        }

        return (
            fetching || !(lesson && _lesson && lessonText.loaded) ?
                <p>Загрузка...</p>
                :

                [
                    this._isMobile ?
                        <Menu lesson={_lesson}
                              isNeedHideRefs={_isNeedHideRefs}
                              episodes={lessonText.episodes}
                              active={_lesson.Id}
                              history={this.props.history}/>
                        :
                        null,
                    _isNeedHideGallery ? null : <GalleryButtons/>,
                    lessonText.loaded ? <GalleryWrapper gallery={lessonText.gallery}/> : null,
                    this._getLessonsBundles(),
                    <LessonInfo lesson={_lesson}/>,
                    <TranscriptPage episodes={lessonText.episodes}
                                    refs={lessonText.refs}
                                    gallery={lessonText.gallery}
                                    isNeedHideGallery={_isNeedHideGallery}
                                    isNeedHideRefs={_isNeedHideRefs}
                                    lesson={_lesson}
                                    history={this.props.history}
                                    courseUrl={this.props.courseUrl}
                                    lessonUrl={this.props.lessonUrl}/>
                ]
        )
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

class GalleryButtons extends React.Component {

    render() {
        const _gallery = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#gallery"/>',
            _prev = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#slider-prev"/>',
            _next = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#slider-next"/>';

        return (
            <div className="js-gallery-controls gallery-controls hide">
                <button className="gallery-trigger js-gallery-trigger" type="button">
                    <span className="visually-hidden">Галерея</span>
                    <svg width="16" height="16" dangerouslySetInnerHTML={{__html: _gallery}}/>
                </button>
                <button className="swiper-button-prev swiper-button-disabled" type="button">
                    <svg width="11" height="18" dangerouslySetInnerHTML={{__html: _prev}}/>
                </button>
                <button className="swiper-button-next" type="button">
                    <svg width="11" height="18" dangerouslySetInnerHTML={{__html: _next}}/>
                </button>
            </div>
        )
    }
}

function mapStateToProps(state, ownProps) {
    return {
        courseUrl: ownProps.match.params.courseUrl,
        lessonUrl: ownProps.match.params.lessonUrl,
        params: ownProps.location.search,

        lessonInfo: state.singleLesson,
        fetching: state.singleLesson.fetching || state.lessonText.fetching,
        lesson: state.singleLesson.object,
        authors: state.singleLesson.authors,
        lessonText: state.lessonText,
        course: state.singleLesson.course,
        lessons: state.lessons,
        authorized: !!state.user.user,

        playInfo: state.lessonPlayInfo.playInfo,
        playingLesson: state.player.playingLesson,
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
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TranscriptLessonPage);