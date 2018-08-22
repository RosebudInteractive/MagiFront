import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';

import Menu from '../components/combined-lesson-page/menu'
import GalleryWrapper from "../components/transcript-page/gallery-slider-wrapper";
import LessonWrapper from '../components/combined-lesson-page/lesson-wrapper';
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
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', TranscriptLessonPage._handleScroll);
        this.props.lessonActions.clearLesson();
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
        let _link = $('.link-to-lecture, .social-block-vertical');
        const _recommend = $('#pictures');
        let st = $(this).scrollTop();

        if ((_link.length) && (_recommend.length)) {
            let coordTop = _recommend.offset().top;

            let _scrollTop = $(window).scrollTop();

            if ((_scrollTop + 550) >= coordTop) {
                _link.css('position', 'absolute').css('top', coordTop).css('margin-top', '-100px');
            } else {
                _link.css('position', 'fixed').css('top', '50%').css('margin-top', '0');
            }

            if (window.innerWidth < 600) {
                if ((_scrollTop + 650) >= coordTop) {
                    _link.css('position', 'absolute').css('top', coordTop).css('margin-top', '-100px');
                } else {
                    // _link.css('position', 'fixed').css('top', '50%').css('margin-top', '0');
                    _link.css('position', 'fixed').css('top', 'auto').css('margin-top', '0');
                }
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
                // closeGallerySlider();
            }
        }
    }

    componentWillReceiveProps(nextProps) {
        if ((this.props.courseUrl !== nextProps.courseUrl) || (this.props.lessonUrl !== nextProps.lessonUrl)) {
            this.props.lessonActions.getLesson(nextProps.courseUrl, nextProps.lessonUrl);
            this.props.lessonActions.getLessonText(nextProps.courseUrl, nextProps.lessonUrl);
        }
    }

    _createBundle(lesson) {
        let {authors, lessons} = this.props;

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

        return (
            fetching || !(lesson && lessonText.loaded) ?
                <p>Загрузка...</p>
                :

                [
                    <Menu lesson={lesson}/>,
                    <GalleryWrapper/>,
                    this._createBundle(lesson),
                    <LessonInfo lesson={lesson}/>,
                    <TranscriptPage episodes={lessonText.episodes}
                                    refs={lessonText.refs}
                                    gallery={lessonText.gallery}
                                    isNeedHideGallery={lesson.IsAuthRequired && !authorized}
                                    isNeedHideRefs={!(lessonText.refs.length > 0)}
                                    lesson={lesson}/>
                ]
        )
    }
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