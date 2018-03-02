import React from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';
// import {SectionsContainer, Section,} from 'react-fullpage';

import $ from 'jquery'
import 'fullpage.js'

import LessonsListWrapper from '../components/lesson-page/lessons-list-wrapper';
import LessonFrame from '../components/lesson-page/lesson-frame';

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

class LectureWrapper extends React.Component {

    static propTypes = {
        lesson: PropTypes.object.isRequired,
        // height: PropTypes.number.isRequired,
        courseUrl: PropTypes.string.isRequired,
        lessonUrl: PropTypes.string.isRequired,
        lessonCount: PropTypes.number.isRequired,
    };

    render() {
        return (
            <section className='fullpage-section lecture-wrapper fp-section fp-table'
                     style={{backgroundImage: "url(" + '/data/' + this.props.lesson.Cover + ")"}}>
                <div className="fp-tableCell">
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
            _linkBack = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#link-back"></use>';
        // _share = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#share"/>';


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

{/*<button type="button" className="social-trigger">*/
}
{/*<svg width="18" height="18" dangerouslySetInnerHTML={{__html: _share}}/>*/
}
{/*</button>*/
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