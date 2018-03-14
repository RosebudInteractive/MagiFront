import './App.css';

import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from "redux";
import {Switch, Route, } from 'react-router-dom'

import CoursePage from './containers/courses-page';
import SingleCoursePage from './containers/single-course-page';
import LessonPage from './containers/lesson-page';
import TranscriptPage from './containers/lesson-transcript-page';
import Player from './containers/player';

import PageHeader from './components/page-header/page-header';
import PageFooter from './components/page-footer/page-footer';

import * as tools from './tools/page-tools';
import * as appActions from './actions/app-actions';

import * as Polifyll from './tools/polyfill';
import {pages} from "./tools/page-tools";

import $ from 'jquery'

Polifyll.registry();

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
        // this._narrowerThan = tools.narrowerThan.bind(this);
        // this._widerThan = tools.widerThan.bind(this);
        // this._widthBetween = tools.widthBetween.bind(this);
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

        let tooltips = $('.js-language, .js-user-block, .js-speed, .js-contents, .js-share');
        $(document).mouseup(function (e) {
            if (tooltips.has(e.target).length === 0){
                tooltips.removeClass('opened');
            }
        });
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
        let _homePath = '/';

        return (
            <Switch>
                <Route exact path={_homePath} component={CoursePage}/>
                <Route path={_homePath + 'category/:url'} component={SingleCoursePage}/>
                <Route path={_homePath + 'play-lesson/:courseUrl/:lessonUrl'} component={Player}/>
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
                {this._getMainDiv()}
                {this.props.currentPage !== pages.lesson ? <PageFooter/> : null}
            </div>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        showFiltersForm: state.pageHeader.showFiltersForm,
        currentPage: state.pageHeader.currentPage,
        size: state.app.size,
        ownProps,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        appActions: bindActionCreators(appActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps, null, { pure: false })(App)
// export default withRouter(connect(mapStateToProps, mapDispatchToProps, null, { pure: false })(App))
