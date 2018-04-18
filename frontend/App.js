import './App.css';

import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from "redux";
import {Switch, Route, withRouter} from 'react-router-dom'

import CoursePage from './containers/courses-page';
import SingleCoursePage from './containers/single-course-page';
import LessonPage from './containers/lesson-page';
import TranscriptPage from './containers/lesson-transcript-page';

import PageHeader from './components/page-header/page-header';
import PageFooter from './components/page-footer/page-footer';

import * as tools from './tools/page-tools';
import * as appActions from './actions/app-actions';

import * as Polifyll from './tools/polyfill';
import {pages} from "./tools/page-tools";

import $ from 'jquery'
import SmallPlayer from "./containers/small-player";

import Platform from 'platform';

Polifyll.registry();

let _homePath = '/';

class App extends Component {

    constructor(props) {


        super(props);
        this.state = {
            direction: '',
            lastScrollPos: 0,
            showHeader: true,
            width: 0,
            height: 0,
        };
        this._handleScroll = this._handleScroll.bind(this);

        console.log(Platform)
        let _isMobile = ((Platform.os.family === "Android") || (Platform.os.family === "iOS"));
        if (_isMobile) {
            this.props.appActions.setAppTypeMobile()
        }
    }

    get width() {
        return this.state.width
    }

    set width(value) {
        this.state.width = value
    }

    get height() {
        return this.state.height
    }

    set height(value) {
        this.setState({height: value})
    }

    get size() {
        return this.props.size
    }

    updateDimensions() {
        this.width = window.innerWidth;
        let _size = tools.getSize(this.width);
        if (_size !== this.size) {
            this.props.appActions.switchSizeTo(_size);
        }

        this.height = window.innerHeight;
    }

    componentDidMount() {
        this.updateDimensions();
        window.addEventListener("resize", this.updateDimensions.bind(this));
        window.addEventListener('scroll', this._handleScroll);

        let tooltips = $('.js-language, .js-user-block');
        $(document).mouseup(function (e) {
            if (tooltips.has(e.target).length === 0) {
                tooltips.removeClass('opened');
            }
        });

        window.onload = () => {
            let _player = $('#myAudio')[0];
            _player.addEventListener('progress', _onProgress, false)
               }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.ownProps.location.pathname !== nextProps.ownProps.location.pathname) {
            if (nextProps.playInfo) {
                let _targetUrl = _homePath + nextProps.playInfo.courseUrl + '/' + nextProps.playInfo.lessonUrl;
                if (nextProps.ownProps.location.pathname !== _targetUrl) {
                    this.props.appActions.switchToSmallPlayer()
                }
            }
        }
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this._handleScroll);
        window.removeEventListener("resize", this.updateDimensions.bind(this));
    }

    _handleScroll(event) {
        if (!event.target.scrollingElement) {
            return
        }

        if (this.state.lastScrollPos > event.target.scrollingElement.scrollTop) {
            this.setState({
                direction: 'top',
                showHeader: true,
                lastScrollPos: event.target.scrollingElement.scrollTop
            });
        } else if (this.state.lastScrollPos < event.target.scrollingElement.scrollTop) {
            this.setState({
                direction: 'bottom',
                showHeader: false,
                lastScrollPos: event.target.scrollingElement.scrollTop
            });
        }
    }

    _getMainDiv() {
        return (
            <Switch>
                <Route exact path={_homePath} component={CoursePage}/>
                <Route path={_homePath + 'category/:url'} component={SingleCoursePage}/>
                <Route path={_homePath + ':courseUrl/:lessonUrl/transcript'} render={(props) => (
                    <TranscriptPage {...props} height={this.height}/>
                )}/>
                <Route path={_homePath + ':courseUrl/:lessonUrl'} component={LessonPage}/>
            </Switch>
        )
    }

    render() {
        return (
            <div className="App global-wrapper" onScroll={this._handleScroll}>
                <PageHeader visible={this.state.showHeader}/>
                <SmallPlayer/>
                {/*<LessonPage visible={false}/>*/}
                {this._getMainDiv()}
                {!((this.props.currentPage === pages.lesson) || (this.props.currentPage === pages.player)) ?
                    <PageFooter/> : null}
            </div>
        );
    }
}

function _onProgress() {
    //get the buffered ranges data
    var ranges = [];
    for (var i = 0; i < this.buffered.length; i++) {
        ranges.push([
            this.buffered.start(i),
            this.buffered.end(i)
        ]);
    }

    //get the current collection of spans inside the container
    // var spans = progress.getElementsByTagName('span');
    //
    // //then add or remove spans so we have the same number as time ranges
    // while (spans.length < media.buffered.length) {
    //     progress.appendChild(document.createElement('span'));
    // }
    // while (spans.length > media.buffered.length) {
    //     progress.removeChild(progress.lastChild);
    // }

    //now iterate through the ranges and convert each set of timings
    //to a percentage position and width for the corresponding span
    // for (var i = 0; i < media.buffered.length; i++) {
    //     spans[i].style.left = Math.round
    //         (
    //             (100 / media.duration) //the width of 1s
    //             *
    //             ranges[i][0]
    //         )
    //         + '%';
    //
    //     spans[i].style.width = Math.round
    //         (
    //             (100 / media.duration) //the width of 1s
    //             *
    //             (ranges[i][1] - ranges[i][0])
    //         )
    //         + '%';
    // }

    alert(`ranges :  ${ranges.length} ended : ${ranges[ranges.length - 1][1]}`)
}

function mapStateToProps(state, ownProps) {
    return {
        showFiltersForm: state.pageHeader.showFiltersForm,
        currentPage: state.pageHeader.currentPage,
        size: state.app.size,
        playInfo: state.player.playingLesson,
        ownProps,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        appActions: bindActionCreators(appActions, dispatch),
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App))
