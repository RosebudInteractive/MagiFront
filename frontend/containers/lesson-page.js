import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import $ from 'jquery'
import 'fullpage.js'

import * as lessonActions from '../actions/lesson-actions';
import * as pageHeaderActions from '../actions/page-header-actions';

import LectureWrapper from '../components/lesson-page/lesson-wrapper'

import {pages} from '../tools/page-tools';

class LessonPage extends React.Component {

    constructor(props) {
        super(props);
        this._mountGuard = false;

        this.state = {
            total: 0,
            current: 0,
        }
    }

    componentWillMount() {
        let {courseUrl, lessonUrl} = this.props;

        this.props.lessonActions.getLesson(courseUrl, lessonUrl);
        this.props.pageHeaderActions.setCurrentPage(pages.lesson);
        $('body').attr('data-page', 'fullpage');
    }

    _mountFullpage() {
        if (($(window).width() > 900)) {
            let _container = $('#fullpage');
            if ((!this._mountGuard) && (_container.length > 0)) {
                const _options = this._getFullpageOptions();
                _container.fullpage(_options)
                this._mountGuard = true;
            }
        }
    }

    componentDidMount() {
        $(document).ready(() => {
            this._mountFullpage();
        });
    }

    componentWillUnmount() {

    }

    componentWillReceiveProps(nextProps) {
        if ((this.props.courseUrl !== nextProps.courseUrl) || (this.props.lessonUrl !== nextProps.lessonUrl)) {
            this.props.lessonActions.getLesson(nextProps.courseUrl, nextProps.lessonUrl);
        }
    }

    _createBundle(lesson, key, isMain) {
        let {authors} = this.props.lessonInfo;

        lesson.Author = authors.find((author) => {
            return author.Id === lesson.AuthorId
        });

        return <LectureWrapper key={key}
                               lesson={lesson}
                               lessonUrl={this.props.lessonUrl}
                               courseUrl={this.props.course.URL}
                               courseTitle={this.props.course.Name}
                               lessonCount={this.props.lessons.object.length}
                               isMain={isMain}
        />
    }

    _getLessonsBundles() {
        let {object: lesson} = this.props.lessonInfo;
        let _bundles = [];

        if (!lesson) return _bundles;

        _bundles.push(this._createBundle(lesson, 'lesson0'), true);

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
            fixedElements: '.js-lectures-menu',
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
            // recordHistory: true,
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
                    <div>
                        <div className='fullpage-wrapper' id='fullpage'>
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