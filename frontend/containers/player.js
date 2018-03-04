import React from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';

import $ from 'jquery'
import 'fullpage.js'

import LessonsListWrapper from '../components/lesson-page/lessons-list-wrapper';

import * as lessonActions from '../actions/lesson-actions';
import * as pageHeaderActions from '../actions/page-header-actions';

import {pages} from '../tools/page-tools';

class LessonPage extends React.Component {

    constructor(props) {
        super(props);
        this._mountGuard = false;

        this.state = {
            total: 0,
            current: 0,
            lastScrollPos: 0
        }
    }

    componentWillMount() {
        let {courseUrl, lessonUrl} = this.props;

        this.props.lessonActions.getLesson(courseUrl, lessonUrl);
        this.props.pageHeaderActions.setCurrentPage(pages.lesson);
    }

    _mountFullpage() {
        let _container = $('#fullpage');
        if ((!this._mountGuard) && (_container.length > 0)) {
            const _options = this._getFullpageOptions();
            _container.fullpage(_options)
            this._mountGuard = true;
        }
    }

    componentDidMount() {
        $(document).ready(() => {
            this._mountFullpage();
        });
    }

    componentWillUnmount() {
        document.getElementById('html').className = this._htmlClassName;
        $.fn.fullpage.destroy('all');
    }

    componentWillReceiveProps(nextProps) {
        if ((this.props.courseUrl !== nextProps.courseUrl) || (this.props.lessonUrl !== nextProps.lessonUrl)) {
            this.props.lessonActions.getLesson(nextProps.courseUrl, nextProps.lessonUrl);
        }
    }

    _createBundle(lesson) {
        let {authors} = this.props.lessonInfo;

        lesson.Author = authors.find((author) => {
            return author.Id === lesson.AuthorId
        });

        return <LectureWrapper
            // height={this.props.height}
            lesson={lesson}
            lessonUrl={this.props.lessonUrl}
            courseUrl={this.props.course.URL}
            courseTitle={this.props.course.Name}
            lessonCount={this.props.lessons.object.length}
        />
    }

    _getLessonsBundles() {
        let {object: lesson} = this.props.lessonInfo;
        let _bundles = [];

        if (!lesson) return _bundles;

        _bundles.push(this._createBundle(lesson, 'lesson0'));

        if (lesson.Lessons) {
            lesson.Lessons.forEach((lesson, index) => {
                _bundles.push(this._createBundle(lesson, 'lesson' + (index + 1)))
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
        _anchors.push({name: 'lesson0', title: lesson.Name});

        lesson.Lessons.forEach((lesson, index) => {
            _anchors.push({name: 'lesson' + (index + 1), title: lesson.Name})
        })

        return _anchors
    }

    _getFullpageOptions() {
        let _anchors = this._getAnchors();


        return {
            normalScrollElements: '.lectures-list-wrapper',
            anchors: _anchors.map((anchor) => {
                return anchor.name
            }),
            navigation: _anchors.length > 1,
            navigationTooltips: _anchors.map((anchor) => {
                return anchor.title
            }),
            css3: true,
            keyboardScrolling: true,
            animateAnchor: true,
            recordHistory: true,
            sectionSelector: '.fullpage-section',
            slideSelector: '.fullpage-slide',
            lazyLoading: true,
        }
    }

    render() {
        let {
            lessonInfo,
            fetching
        } = this.props;

        if (lessonInfo.object) {
            this._mountFullpage()
        }

        return (
            fetching ?
                <p>Загрузка...</p>
                :
                lessonInfo.object ?
                    <div className='fullpage-wrapper' id='fullpage'>
                        {this._getLessonsBundles()}
                    </div>
                    :
                    null
        )
    }
}


class PlayerWrapper extends React.Component {

    static propTypes = {
        lesson: PropTypes.object.isRequired,
        // height: PropTypes.number.isRequired,
        courseUrl: PropTypes.string.isRequired,
        lessonUrl: PropTypes.string.isRequired,
        lessonCount: PropTypes.number.isRequired,
    };

    render() {
        return (
            <section className='fullpage-section lecture-wrapper'>
                <div className="fp-tableCell">
                    <Menu {...this.props} current={this.props.lesson.Number} total={this.props.lessonCount}/>
                    <Link to={this.props.lessonUrl + "/transcript"} className="link-to-transcript _reduced">Транскрипт <br/>и
                        материалы</Link>
                    <PlayerFrame lesson={this.props.lesson}/>
                </div>
            </section>
        )
    }
}

class PlayerFrame extends React.Component {

    static propTypes = {
        lesson: PropTypes.object.isRequired,
    };

    render() {
        let {lesson} = this.props;

        const _backwards = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#backward"/>',
            _pause = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#pause"/>',
            _sound = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#sound"/>',
            _speed = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#speed"/>',
            _contents = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#contents"/>',
            _fullscreen = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#fullscreen"/>',
            _screen = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#screen"/>'



        return (
            <div className="player-frame">
                <div className="player-frame__poster">
                    <img src={'/data/' + lesson.Cover} width="1025" height="577" alt=""/>
                        <div className="player-frame__poster-text">
                            <h2 className="player-frame__poster-title">«Физика» Аристотеля с греческим оригиналом на полях рукописи.</h2>
                            <p className="player-frame__poster-subtitle">Средневековый латинский манускрипт. Bibliotheca Apostolica Vaticana, Рим.</p>
                        </div>
                </div>
                <div className="player-block">
                    <div className="player-block__progress">
                        <div className="player-block__load" style={{width: "33.5%"}}/>
                        <div className="player-block__play" style={{width: "20%"}}><span className="indicator"/></div>
                        <div className="player-block__gap" style={{eft: "5%"}}/>
                        <div className="player-block__time" style={{left: "30%"}}>50:01</div>
                    </div>
                    <div className="player-block__row">
                        <div className="player-block__controls">
                            <button type="button" className="backwards">
                                <svg width="18" height="11" dangerouslySetInnerHTML={{__html: _backwards}}/>
                            </button>
                            <button type="button" className="play-button">
                                <svg className="pause" width="11" height="18" dangerouslySetInnerHTML={{__html: _pause}}/>
                            </button>
                            <button type="button" className="sound-button">
                                <svg width="18" height="18" dangerouslySetInnerHTML={{__html: _sound}}/>
                            </button>
                        </div>
                        <div className="player-block__stats">
                            <div className="player-block__info">
                                <span className="played-time">20:01</span>
                                <span className="divider">/</span>
                                <span className="total-time">1:35:54</span>
                            </div>
                            <button type="button" className="speed-button js-speed-trigger">
                                <svg width="18" height="18" dangerouslySetInnerHTML={{__html: _speed}}/>
                            </button>
                            <button type="button" className="content-button js-contents-trigger">
                                <svg width="18" height="12" dangerouslySetInnerHTML={{__html : _contents}}/>
                            </button>
                            <button type="button" className="fullscreen-button js-fullscreen">
                                <svg className="full" width="20" height="18" dangerouslySetInnerHTML={{__html: _fullscreen}}/>
                                <svg className="normal" width="20" height="18" dangerouslySetInnerHTML={{__html: _screen}}/>
                            </button>
                        </div>
                        <div className="contents-tooltip js-player-tooltip js-contents scrollable">
                            <header className="contents-tooltip__header">
                                <p className="contents-tooltip__title">Оглавление</p>
                            </header>
                            <ol className="contents-tooltip__body">
                                <li className="active"><a href="#">«К чему эти смехотворные чудовища?»</a></li>
                                <li><a href="#">Строгие формы аббатства Фонтене</a></li>
                                <li><a href="#">Танцующие и плачущие святые</a></li>
                                <li><a href="#">«Эпоха образа до эпохи искусства»</a></li>
                                <li><a href="#">Категория стиля</a></li>
                                <li><a href="#">Стиль и политика</a></li>
                            </ol>
                        </div>
                        <div className="speed-tooltip js-player-tooltip js-speed">
                            <header className="speed-tooltip__header">
                                <p className="speed-tooltip__title">Скорость</p>
                            </header>
                            <ul className="speed-tooltip__body">
                                <li>0.25</li>
                                <li>0.5</li>
                                <li>0.75</li>
                                <li className="active">Обычная</li>
                                <li>1.25</li>
                                <li>1.5</li>
                                <li>2</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

class Menu extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            opened: false
        }
    }

    static propTypes = {
        courseTitle: PropTypes.string.isRequired,
        courseUrl: PropTypes.string.isRequired,
        current: PropTypes.number.isRequired,
        total: PropTypes.number.isRequired,
    };

    _switchMenu() {
        this.setState({opened: !this.state.opened})
    }


    render() {
        const _logoMob = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#logo-mob"/>',
            _linkBack = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#link-back"></use>';

        return (
            <div className={"lectures-menu _dark" + (this.state.opened ? ' opened' : '')}>
                <div className="lectures-menu__section">
                    <Link to={'/'} className="logo-min">
                        <svg width="75" height="40" dangerouslySetInnerHTML={{__html: _logoMob}}/>
                    </Link>
                    <Link to={'/category/' + this.props.courseUrl} className="lectures-menu__link-back">
                        <div className="icon">
                            <svg width="18" height="18" dangerouslySetInnerHTML={{__html: _linkBack}}/>
                        </div>
                        <span><span className="label">Курс:</span>{' ' + this.props.courseTitle}</span>
                    </Link>
                </div>
                <div className="lectures-menu__section lectures-list-block">
                    <button type="button" className="lectures-list-trigger js-lectures-list-trigger"
                            onClick={::this._switchMenu}><span>Лекция </span>
                        <span className="num"><span
                            className="current">{this.props.current}</span>{'/' + this.props.total}</span></button>
                    <LessonsListWrapper {...this.props}/>
                </div>

            </div>
        )
    }
}

function mapStateToProps(state, ownProps) {
    return {
        courseUrl: ownProps.match.params.courseUrl,
        lessonUrl: ownProps.match.params.lessonUrl,
        fetching: state.singleLesson.fetching,
        lessonInfo: state.singleLesson,
        course: state.singleLesson.course,
        lessons: state.lessons,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        lessonActions: bindActionCreators(lessonActions, dispatch),
        pageHeaderActions: bindActionCreators(pageHeaderActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LessonPage);