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
import * as userActions from './actions/user-actions';
import * as playerActions from './actions/player-actions';
import * as playerStartActions from './actions/player-start-actions';

import * as Polifyll from './tools/polyfill';
import {pages} from "./tools/page-tools";

import $ from 'jquery'
import SmallPlayer from "./containers/small-player";
import AuthPopup from './containers/auth-form'
import AuthConfirmForm from './containers/auth-confirm-form'
import PasswordConfirmForm from './containers/password-confirm-form'
import AuthErrorForm from './containers/auth-error-form'

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

    componentWillMount() {
        let _errorRout = this.props.location.pathname.startsWith('/auth/error'),
            _recoveryRout = this.props.location.pathname.startsWith('/recovery')

        if (!(_recoveryRout || _errorRout))
            this.props.userActions.whoAmI()
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

        this.props.playerActions.startInit()
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.ownProps.location.pathname !== nextProps.ownProps.location.pathname) {
            if (nextProps.playInfo) {
                let _targetUrl = _homePath + nextProps.playInfo.courseUrl + '/' + nextProps.playInfo.lessonUrl;
                if (nextProps.ownProps.location.pathname !== _targetUrl) {
                    this.props.appActions.switchToSmallPlayer()
                    // todo : Очистку аудио надо убрать, когда действительно будет переключение на маленький плеер
                    this.props.playerStartActions.clearAudios()
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
                <Route path={_homePath + 'activation-confirm/:activationKey'} component={AuthConfirmForm}/>
                <Route path={_homePath + 'auth/error'} component={AuthErrorForm}/>
                <Route path={_homePath + 'recovery/:activationKey'} component={PasswordConfirmForm}/>
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
                {this._getMainDiv()}
                {!((this.props.currentPage === pages.lesson) || (this.props.currentPage === pages.player)) ?
                    <PageFooter/> : null}
                {
                    this.props.showSignInForm ?
                        <AuthPopup/>
                        :
                        null
                }
            </div>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        showFiltersForm: state.pageHeader.showFiltersForm,
        currentPage: state.pageHeader.currentPage,
        size: state.app.size,
        playInfo: state.player.playingLesson,
        showSignInForm: state.app.showSignInForm,
        ownProps,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        appActions: bindActionCreators(appActions, dispatch),
        userActions: bindActionCreators(userActions, dispatch),
        playerActions: bindActionCreators(playerActions, dispatch),
        playerStartActions: bindActionCreators(playerStartActions, dispatch),
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App))
