import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';

import Menu from '../components/combined-lesson-page/menu'
import GalleryWrapper from "../components/transcript-page/gallery-slider-wrapper";
import LessonWrapper from '../components/combined-lesson-page/lesson-wrapper';
import LessonInfo from '../components/combined-lesson-page/lesson-info';
import TranscriptPage from '../components/combined-lesson-page/transcript-page';
import GallerySlides from '../components/transcript-page/gallery-slides';

import * as lessonActions from '../actions/lesson-actions';
import * as pageHeaderActions from '../actions/page-header-actions';
import * as userActions from "../actions/user-actions";

import {pages} from '../tools/page-tools';
import $ from 'jquery'
import * as storageActions from "../actions/lesson-info-storage-actions";
import * as appActions from "../actions/app-actions";
import * as playerStartActions from "../actions/player-start-actions";

import '@fancyapps/fancybox/dist/jquery.fancybox.js';

class TranscriptLessonPage extends React.Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        let {courseUrl, lessonUrl} = this.props;

        this.props.userActions.whoAmI();
        this.props.storageActions.refreshState();

        this.props.lessonActions.getLesson(courseUrl, lessonUrl);
        this.props.lessonActions.getLessonsAll(courseUrl, lessonUrl);
        this.props.lessonActions.getLessonText(courseUrl, lessonUrl);

        this.props.pageHeaderActions.setCurrentPage(pages.lesson, courseUrl, lessonUrl);
    }

    componentDidMount() {
        window.addEventListener('scroll', TranscriptLessonPage._handleScroll);
        $('body').toggleClass('_player');
        $('[data-fancybox]').fancybox();
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', TranscriptLessonPage._handleScroll);
        this.props.lessonActions.clearLesson();
        $('body').removeClass('_player');
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

    static _handleScroll() {
        // const _recommend = $('#pictures');
        let _controls = $('.js-gallery-controls');
        // var windowHeight = $(window).height();

        if (_controls.length) {
            // var coordTop = $('#recommend').offset().top;
            //
            // if ($(window).width() < 768 ) {
            //     if ($(window).scrollTop() + windowHeight >= coordTop) {
            //         _controls.css('position', 'absolute').css('bottom', 'auto').css('top', coordTop - 55);
            //         if (_controls.hasClass('show')) {
            //             closeGallerySlider();
            //         }
            //     } else {
            //         $('.js-gallery-controls').css('position', 'fixed').css('top', 'auto').css('bottom', '10px').css('margin-top', '0');
            //     }
            // } else {
            //     if ($(window).scrollTop() + windowHeight >= coordTop) {
            //         _controls.css('position', 'absolute').css('top', coordTop).css('transform', 'none').css('bottom', 'auto');
            //         if (_controls.hasClass('show')) {
            //             closeGallerySlider();
            //         }
            //     } else {
            //         $('.js-gallery-controls').css('position', 'fixed').css('bottom', '20px').css('top', 'auto').css('margin-top', '-60px');
            //     }
            // }

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

        let st = $(this).scrollTop();

        // if ((_link.length) && (_recommend.length)) {
        //     let coordTop = _recommend.offset().top;
        //
        //     let _scrollTop = $(window).scrollTop();
        //
        //     if ((_scrollTop + 550) >= coordTop) {
        //         _link.css('position', 'absolute').css('top', coordTop).css('margin-top', '-100px');
        //     } else {
        //         _link.css('position', 'fixed').css('top', '50%').css('margin-top', '0');
        //     }
        //
        //     if (window.innerWidth < 600) {
        //         if ((_scrollTop + 650) >= coordTop) {
        //             _link.css('position', 'absolute').css('top', coordTop).css('margin-top', '-100px');
        //         } else {
        //             // _link.css('position', 'fixed').css('top', '50%').css('margin-top', '0');
        //             _link.css('position', 'fixed').css('top', 'auto').css('margin-top', '0');
        //         }
        //     }
        // }

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
            } else {
                $('.js-lectures-menu').addClass('_dark');
                $('.js-lectures-menu').removeClass('_fixed');
            }

            if (st < $('.js-player').outerHeight()) {
                closeGallerySlider();
            }
        }
    }

    componentWillReceiveProps(nextProps) {
        if ((this.props.courseUrl !== nextProps.courseUrl) || (this.props.lessonUrl !== nextProps.lessonUrl)) {
            this.props.lessonActions.getLesson(nextProps.courseUrl, nextProps.lessonUrl);
            this.props.lessonActions.getLessonText(nextProps.courseUrl, nextProps.lessonUrl);
        }
    }

    _getLessonsBundles() {
        let lesson = this._getLesson();

        return lesson ? this._createBundle(lesson) : null;
    }

    _getLesson() {
        let {lessonUrl, lessonInfo} = this.props,
            lesson = lessonInfo.object;

        return (lesson.URL === lessonUrl) ? lesson : lesson.Lessons.find((subLesson) => {
            return subLesson.URL === lessonUrl
        })
    }

    _createBundle(lesson) {
        let {authors} = this.props.lessonInfo;
        let {lessons} = this.props;

        lesson.Author = authors.find((author) => {
            return author.Id === lesson.AuthorId
        });


        let _playingLessonUrl = (lesson.URL === this.props.lessonUrl) && (this.props.params === '?play'),
            _lessonInPlayer = (this.props.playingLesson && (lesson.URL === this.props.playingLesson.lessonUrl))

        let _lessonAudios = null;

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

        let _audios = _lessonAudios ? _lessonAudios.Audios : null;

        return <LessonWrapper lesson={lesson}
                              courseUrl={this.props.courseUrl}
                              lessonUrl={lesson.URL}
                              active={lesson.Number}
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

        return (
            fetching || !(lesson && lessonText.loaded) ?
                <p>Загрузка...</p>
                :

                [
                    <Menu lesson={this._getLesson()}
                          isNeedHideRefs={_isNeedHideRefs}
                          episodes={lessonText.episodes}/>,
                    _isNeedHideGallery ? null : <GalleryButtons/>,
                    lessonText.loaded ? <GalleryWrapper gallery={lessonText.gallery}/> : null,
                    this._getLessonsBundles(),
                    <LessonInfo lesson={this._getLesson()}/>,
                    <TranscriptPage episodes={lessonText.episodes}
                                    refs={lessonText.refs}
                                    gallery={lessonText.gallery}
                                    isNeedHideGallery={_isNeedHideGallery}
                                    isNeedHideRefs={_isNeedHideRefs}
                                    lesson={this._getLesson()}/>
                ]
        )
    }
}

// function openGallerySlider() {
//     var controls = $('.js-gallery-controls'),
//         wrap = $('.js-gallery-slider-wrapper'),
//         stickyBlock = $('.js-sticky-block');
//
//     controls.removeClass('hide').addClass('show');
//     wrap.addClass('show');
//     stickyBlock.addClass('slider-opened');
// }

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
        isLessonMenuOpened: state.app.isLessonMenuOpened,
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