import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';

import TranscriptPage from '../components/transcript-page/transcript-page';

import * as lessonActions from '../actions/lesson-actions';
import * as pageHeaderActions from '../actions/page-header-actions';

import {pages} from '../tools/page-tools';
import $ from 'jquery'

class TranscriptLessonPage extends React.Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        let {courseUrl, lessonUrl} = this.props;

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
        let _link = $('.link-to-lecture');
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

        return (
            <div>
                <Link to={'/' + this.props.courseUrl + '/' + this.props.lessonUrl}
                      className="link-to-lecture"
                      id='link-to-lecture'
                      style={{
                          position: 'fixed',
                          top: '50%',
                          marginTop: 0
                      }}
                >Смотреть <br/>лекцию</Link>
                <SocialBlock/>
                {
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
                                                    lesson={lesson}/>
                                </div>
                            </div>
                            :
                            null
                }
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
    }
}

function mapDispatchToProps(dispatch) {
    return {
        lessonActions: bindActionCreators(lessonActions, dispatch),
        pageHeaderActions: bindActionCreators(pageHeaderActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TranscriptLessonPage);