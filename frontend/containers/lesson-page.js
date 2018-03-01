import React from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';
import {SectionsContainer, Section,} from 'react-fullpage';

import LessonsListWrapper from '../components/lesson-page/lessons-list-wrapper';
import LessonFrame from '../components/lesson-page/lesson-frame';

import * as lessonActions from '../actions/lesson-actions';
import * as pageHeaderActions from '../actions/page-header-actions';

import {pages} from '../tools/page-tools';

class LessonPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            total: 0,
            current: 0,
            lastScrollPos: 0
        }
    }

    componentWillMount() {
        this._htmlClassName = document.getElementById('html').className;
        document.getElementById('html').className = 'fp-enabled';

        let {courseUrl, lessonUrl} = this.props;

        this.props.lessonActions.getLesson(courseUrl, lessonUrl);
        this.props.pageHeaderActions.setCurrentPage(pages.lesson);
    }

    componentWillUnmount() {
        document.getElementById('html').className = this._htmlClassName;
    }

    componentWillReceiveProps(nextProps) {
        if ((this.props.courseUrl !== nextProps.courseUrl) || (this.props.lessonUrl !== nextProps.lessonUrl)) {
            this.props.lessonActions.getLesson(nextProps.courseUrl, nextProps.lessonUrl);
        }
    }

    _createBundle(lesson, anchor) {
        let {authors} = this.props.lessonInfo;

        lesson.Author = authors.find((author) => {
            return author.Id === lesson.AuthorId
        });

        return <Section id={anchor} key={anchor}>
            <LectureWrapper
                height={this.props.height}
                lesson={lesson}
                lessonUrl={this.props.lessonUrl}
                courseUrl={this.props.course.URL}
                courseTitle={this.props.course.Name}
                lessonCount={this.props.lessons.object.length}
            />
        </Section>
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

        let _anchors = [];
        _anchors.push({name: 'lesson0', title: lesson.Name});

        lesson.Lessons.forEach((lesson, index) => {
            _anchors.push({name: 'lesson' + (index + 1), title: lesson.Name})
        })

        return _anchors
    }

    _getSectionOptions() {
        let _anchors = this._getAnchors().map((anchor) => {
            return anchor.name
        });

        let _props = {
            className: 'fullpage-wrapper',
            sectionClassName: 'fp-section fp-table',
            delay: 700,
            scrollBar: false,
            navigation: true,
            arrowNavigation: true,
            // navigationClass: 'right',
            // navigationAnchorClass: 'fp-tooltip right',
        };

        if (_anchors.length > 1) {
            _props.anchors = _anchors
        }

        return _props
    }

    _getFullPageOptions() {
        const _options = {
            // for mouse/wheel events
            // represents the level of force required to generate a slide change on non-mobile, 10 is default
            scrollSensitivity: 0,

            // for touchStart/touchEnd/mobile scrolling
            // represents the level of force required to generate a slide change on mobile, 10 is default
            touchSensitivity: 0,
            scrollSpeed: 300,
            hideScrollBars: true,
            enableArrowKeys: true
        }

        _options.slides = this._getLessonsBundles()

        return _options;
    }

    render() {
        let {
            lessonInfo,
            fetching
        } = this.props;


        return (
            <div>
                {
                    fetching ?
                        <p>Загрузка...</p>
                        :
                        lessonInfo.object ?
                            <div>
                                <SectionsContainer {...this._getSectionOptions()}>
                                    {this._getLessonsBundles()}
                                </SectionsContainer>
                            </div>
                            :
                            null
                }
            </div>
        )
    }
}

class LectureWrapper extends React.Component {

    static propTypes = {
        lesson: PropTypes.object.isRequired,
        height: PropTypes.number.isRequired,
        courseUrl: PropTypes.string.isRequired,
        lessonUrl: PropTypes.string.isRequired,
        lessonCount: PropTypes.number.isRequired,
    };

    render() {
        return (
            <section className='fullpage-section lecture-wrapper fp-section fp-table'
                     style={{backgroundImage: "url(" + '/data/' + this.props.lesson.Cover + ")"}}>
                <div className="fp-tableCell" style={{height: this.props.height}}>
                    <Menu {...this.props} current={this.props.lesson.Number} total={this.props.lessonCount}/>
                    <Link to={this.props.lessonUrl + "/transcript"} className="link-to-transcript">Транскрипт <br/>и
                        материалы</Link>
                    <LessonFrame lesson={this.props.lesson}/>
                </div>
            </section>
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
            _linkBack = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#link-back"></use>',
            _share = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#share"/>';


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
                <button type="button" className="social-trigger">
                    <svg width="18" height="18" dangerouslySetInnerHTML={{__html: _share}}/>
                </button>
            </div>
        )
    }
}

// class Navigator extends React.Component {
//     static propTypes = {
//         anchors: PropTypes.array.isRequired
//
//     }
//
//     _getList() {
//         return this.props.anchors.map((anchor, index) => {
//             return <li key={index}><Link to={'#' + anchor.name}><span/></Link>
//                 <div className="fp-tooltip right">{anchor.title}</div>
//             </li>
//         })
//     }
//
//     render() {
//         return (
//             <div id="fp-nav" className="right" style={{marginTop: '-66px;'}}>
//                 <ul>
//                     {this._getList()}
//                 </ul>
//             </div>
//         )
//     }
// }

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