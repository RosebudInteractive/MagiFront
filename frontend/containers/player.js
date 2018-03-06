import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import $ from 'jquery'
import 'fullpage.js'

import * as lessonActions from '../actions/lesson-actions';
import * as pageHeaderActions from '../actions/page-header-actions';

import PlayerWrapper from '../components/player/wrapper'
import NestedPlayer from '../components/player/nested-player';

import {pages} from '../tools/page-tools';

class Player extends React.Component {

    constructor(props) {
        super(props);
        this._mountGuard = false;

        this.state = {
            total: 0,
            current: 0,
            currentContents: [],
            playTime: 0,
            content: 0
        }

        this._lessonId = 0;
    }

    componentWillMount() {
        let {courseUrl, lessonUrl} = this.props;

        this.props.lessonActions.getLesson(courseUrl, lessonUrl);
        this.props.pageHeaderActions.setCurrentPage(pages.player);
        $('body').attr('data-page', 'fullpage');
    }

    _mountFullpage() {
        let _container = $('#fullpage');
        if ((!this._mountGuard) && (_container.length > 0)) {
            const _options = this._getFullpageOptions();
            _container.fullpage(_options)
            this._mountGuard = true;
        }
    }

    _mountPlayer() {
        let _container = $('#player');
        if ((!this._mountPlayerGuard) && (_container.length > 0) && (this.props.lessonPlayInfo.object)) {
            let _options = {
                data: this.props.lessonPlayInfo.object,
                div: _container,
                onRenderContent: (content) => {this.setState({currentContents : content})},
                onCurrentTimeChanged: (e) => {this.setState({playTime : e})},
                onChangeContent: (e) => {this.setState({content: e.id})}
            };

            this._player = NestedPlayer(_options);
            this._mountPlayerGuard = true;
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
        $('body').removeAttr('data-page');
    }

    componentWillReceiveProps(nextProps) {
        if ((this.props.courseUrl !== nextProps.courseUrl) || (this.props.lessonUrl !== nextProps.lessonUrl)) {
            this.props.lessonActions.getLesson(nextProps.courseUrl, nextProps.lessonUrl);
        }

        if ((nextProps.lessonInfo.object) && (nextProps.lessonInfo.object.Id !== this._lessonId)) {
            this._lessonId = nextProps.lessonInfo.object.Id;
            this.props.lessonActions.getLessonPlayInfo(this._lessonId)
        }
    }

    _createBundle(lesson) {
        let {authors} = this.props.lessonInfo;

        lesson.Author = authors.find((author) => {
            return author.Id === lesson.AuthorId
        });

        return <PlayerWrapper
            lesson={lesson}
            lessonUrl={this.props.lessonUrl}
            courseUrl={this.props.course.URL}
            courseTitle={this.props.course.Name}
            lessonCount={this.props.lessons.object.length}
            onPause={::this._handlePause}
            onPlay={::this._handlePlay}
            content={this.state.currentContents}
            currentContent={this.state.content}
            onGoToContent={::this._handleGoToContent}
            onSetRate={::this._handleSetRate}
            playTime={this.state.playTime}
        />
    }

    _handlePause(){
        if (this._player) {
            this._player.pause()
        }
    }

    _handlePlay(){
        if (this._player) {
            this._player.play()
        }
    }

    _handleSetRate(value) {
        if (this._player) {
            this._player.setRate(value)
        }
    }

    _handleGoToContent(position) {
        if (this._player) {
            this._player.setPosition(position)
        }
    }

    _getBundles() {
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
            this._mountFullpage();
            this._mountPlayer();
        }

        return (
            fetching ?
                <p>Загрузка...</p>
                :
                lessonInfo.object ?
                    <div className='fullpage-wrapper' id='fullpage'>
                        {this._getBundles()}
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
        lessonPlayInfo: state.lessonPlayInfo,
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

export default connect(mapStateToProps, mapDispatchToProps)(Player);