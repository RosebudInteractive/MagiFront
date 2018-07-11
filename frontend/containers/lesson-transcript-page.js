import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';

import TranscriptPage from '../components/transcript-page/transcript-page';

import * as lessonActions from '../actions/lesson-actions';
import * as pageHeaderActions from '../actions/page-header-actions';
import * as userActions from "../actions/user-actions";

import {pages} from '../tools/page-tools';
import $ from 'jquery'
import GalleryWrapper from "../components/transcript-page/gallery-slider-wrapper";

class TranscriptLessonPage extends React.Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        let {courseUrl, lessonUrl} = this.props;

        this.props.userActions.whoAmI()

        if (!this._lessonLoaded(courseUrl, lessonUrl)) {
            this.props.lessonActions.getLesson(courseUrl, lessonUrl);
        }

        if (!this.props.lessons.loaded) {
            this.props.lessonActions.getLessonsAll(courseUrl, lessonUrl);
        }

        this.props.lessonActions.getLessonText(courseUrl, lessonUrl);
        this.props.pageHeaderActions.setCurrentPage(pages.transcript, courseUrl, lessonUrl);
    }

    componentDidMount() {
        window.addEventListener('scroll', TranscriptLessonPage._handleScroll);
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', TranscriptLessonPage._handleScroll);
    }

    componentDidUpdate() {
        TranscriptLessonPage._handleScroll()

        if (this.props.lesson) {
            document.title = 'Транскрипт: ' + this.props.lesson.Name + ' - Магистерия'
        }
    }

    _lessonLoaded() {
        return false
    }

    static _handleScroll() {
        let _link = $('.link-to-lecture, .social-block-vertical');
        const _recommend = $('#gallery');

        if ((_link.length) && (_recommend.length)) {
            let coordTop = _recommend.offset().top;

            let _scrollTop = $(window).scrollTop();

            if ((_scrollTop + 550) >= coordTop) {
                _link.css('position', 'absolute').css('top', coordTop).css('margin-top', '-100px');
            } else {
                _link.css('position', 'fixed').css('top', '50%').css('margin-top', '0');
            }

            if ($(window).width() < 768) {
                if ((_scrollTop + 650) >= coordTop) {
                    _link.css('position', 'absolute').css('top', coordTop).css('margin-top', '-100px');
                } else {
                    _link.css('position', 'fixed').css('top', 'auto').css('margin-top', '0');
                }
            }
        }
    }

    // static _handleScroll() {
    //     let //_controls = $('.js-gallery-controls'),
    //         _link = $('.link-to-lecture, .social-block-vertical'),
    //         // _windowHeight = $(window).height(),
    //         _scrollTop = $(window).scrollTop();
    //
    //     // Для новой галереи
    //     // const _recommend = $('#recommend');
    //     const _recommend = $('#gallery');
    //
    //     if ((_link.length) && (_recommend.length)) {
    //         let coordTop = _recommend.offset().top;
    //
    //         if ((_scrollTop + 550) >= coordTop) {
    //             _link.css('position', 'absolute').css('top', coordTop).css('margin-top', '-100px');
    //         } else {
    //             _link.css('position', 'fixed').css('top', '50%').css('margin-top', '0');
    //         }
    //
    //         // Это из новой галереи
    //         // if ((_scrollTop + _windowHeight / 2 + 120) >= coordTop) {
    //         //     _link.css('position', 'absolute').css('top', coordTop).css('margin-top', '-100px');
    //         // } else {
    //         //     _link.css('position', 'fixed').css('top', '50%').css('margin-top', '0');
    //         // }
    //
    //
    //         if ($(window).width() < 768) {
    //
    //             // Это из новой галереи
    //             // if ((_scrollTop + _windowHeight) >= coordTop) {
    //             //     $('.js-sticky-block').css('position', 'absolute').css('top', coordTop).css('bottom', 'auto').css('margin-top', '-100px');
    //             // } else {
    //             //     $('.js-sticky-block').css('position', 'fixed').css('top', 'auto').css('bottom', '30px').css('margin-top', '0');
    //             // }
    //
    //             if ((_scrollTop + 650) >= coordTop) {
    //                 _link.css('position', 'absolute').css('top', coordTop).css('margin-top', '-100px');
    //             } else {
    //                 _link.css('position', 'fixed').css('top', 'auto').css('margin-top', '0');
    //             }
    //         }
    //     }
    //
    //     //Для новой галереи
    //     // if (_controls.length && _recommend.length) {
    //     //     let coordTop = $('#recommend').offset().top;
    //     //
    //     //     if ($(window).width() < 768 ) {
    //     //         if ((_scrollTop + _windowHeight) >= coordTop) {
    //     //             _controls.css('position', 'absolute').css('bottom', 'auto').css('top', coordTop - 55);
    //     //             if (_controls.hasClass('show')) {
    //     //                 // closeGallerySlider();
    //     //             }
    //     //         } else {
    //     //             _controls.css('position', 'fixed').css('top', 'auto').css('bottom', '10px').css('margin-top', '0');
    //     //         }
    //     //     } else {
    //     //         if ((_scrollTop + _windowHeight) >= coordTop) {
    //     //             _controls.css('position', 'absolute').css('top', coordTop).css('transform', 'none').css('bottom', 'auto');
    //     //             if (_controls.hasClass('show')) {
    //     //             //     closeGallerySlider();
    //     //             }
    //     //         } else {
    //     //             _controls.css('position', 'fixed').css('bottom', '20px').css('top', 'auto').css('margin-top', '-60px');
    //     //         }
    //     //     }
    //     // }
    // }

    componentWillReceiveProps(nextProps) {
        if ((this.props.courseUrl !== nextProps.courseUrl) || (this.props.lessonUrl !== nextProps.lessonUrl)) {
            this.props.lessonActions.getLesson(nextProps.courseUrl, nextProps.lessonUrl);
            this.props.lessonActions.getLessonText(nextProps.courseUrl, nextProps.lessonUrl);
        }
    }

    render() {
        let {
            lesson,
            lessonText,
            fetching,
            authorized
        } = this.props;

        const _linkStyle = {position: 'fixed', top: '50%', marginTop: 0};

        return [
            <div className="sticky-block js-sticky-block" style={_linkStyle}>
                <Link to={'/' + this.props.courseUrl + '/' + this.props.lessonUrl} className="link-to-lecture" id='link-to-lecture'>
                    Смотреть <br/>лекцию
                </Link>
            </div>,
            //<GalleryButtons/>,
            <SocialBlock/>,
            // lessonText.loaded ? <GalleryWrapper gallery={lessonText.gallery}/> : null,
            fetching ?
                <p>Загрузка...</p>
                :
                (lesson && lessonText.loaded) ?
                    <div>
                        <div className="transcript-page">
                            <TranscriptPage episodes={lessonText.episodes}
                                            refs={lessonText.refs}
                                            gallery={lessonText.gallery}
                                            isNeedHideGallery={lesson.IsAuthRequired && !authorized}
                                            isNeedHideRefs={!(lessonText.refs.length > 0)}
                                            lesson={lesson}/>
                        </div>
                    </div>
                    :
                    null

        ]
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


class SocialBlock extends React.Component {


    render() {
        const _tw = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#tw"/>',
            _fb = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#fb"/>',
            _vk = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#vk"/>',
            _ok = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#ok"/>'

        return (
            <div className="social-block-vertical">
                <a href="#" className="social-btn-dark">
                    <div className="social-btn-dark__icon">
                        <svg width="27" height="22" dangerouslySetInnerHTML={{__html: _tw}}/>
                    </div>
                    <span className="social-btn-dark__actions">19</span>
                </a>
                <a href="#" className="social-btn-dark _active">
                    <div className="social-btn-dark__icon">
                        <svg width="24" height="24" dangerouslySetInnerHTML={{__html: _fb}}/>
                    </div>
                    <span className="social-btn-dark__actions">64</span>
                </a>
                <a href="#" className="social-btn-dark _active">
                    <div className="social-btn-dark__icon">
                        <svg width="26" height="15" dangerouslySetInnerHTML={{__html: _vk}}/>
                    </div>
                    <span className="social-btn-dark__actions">91</span>
                </a>
                <a href="#" className="social-btn-dark _active">
                    <div className="social-btn-dark__icon">
                        <svg width="14" height="24" dangerouslySetInnerHTML={{__html: _ok}}/>
                    </div>
                    <span className="social-btn-dark__actions"/>
                </a>
            </div>
        )
    }
}

function mapStateToProps(state, ownProps) {
    return {
        courseUrl: ownProps.match.params.courseUrl,
        lessonUrl: ownProps.match.params.lessonUrl,
        fetching: state.singleLesson.fetching || state.lessonText.fetching,
        lesson: state.singleLesson.object,
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
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TranscriptLessonPage);