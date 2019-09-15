import { hot } from 'react-hot-loader/root'
import 'url-search-params-polyfill';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from "redux";
import {Switch, Route, withRouter} from 'react-router-dom'
// import MetaTags from 'react-meta-tags';
import CoursePage from './containers/courses-page';
import SingleCoursePage from './containers/single-course-page';
import CombineLessonPage, {scroll} from './containers/combined-lesson-page';
import AuthorPage from './containers/author-page'
import ProfilePage from './containers/profile-page'
import BookmarksPage from './containers/bookmark-page'
import PurchasesPage from './containers/purchases-page'
import ProjectPage from './containers/project-page'

import PageHeader from './components/page-header/page-header';
import PageFooter from './components/page-footer/page-footer';
import FeedbackMessageBox from './components/messages/feedback';
import FeedbackResultMessage from './components/messages/feedback-result-message';

import * as tools from './tools/page-tools';
import * as appActions from './actions/app-actions';
import * as userActions from './actions/user-actions';
import * as playerActions from './actions/player-actions';
import * as playerStartActions from './actions/player-start-actions';
import {getUserBookmarks, getUserPaidCourses} from "./ducks/profile";
import {getParameters} from "./ducks/params";
import {setWaitingAuthorizeData as setBillingWaitingAuthorizeData,} from "./ducks/billing";
import {setWaitingAuthorizeData as setPlayerWaitingAuthorizeData,} from "./ducks/player";
import {showFeedbackWindowSelector} from "./ducks/message";
import {showFeedbackResultMessageSelector} from "./ducks/message";
import {loadVersion} from "ducks/version"

import * as Polyfill from './tools/polyfill';

import $ from 'jquery'
import SmallPlayer from "./containers/small-player";
import AuthPopup from './containers/auth-form'
import AuthConfirmForm from './containers/auth-confirm-form'
import PasswordConfirmForm from './containers/password-confirm-form'
import AuthErrorForm from './containers/auth-error-form'
import NotFound from './components/not-found'

import SizeInfo from './components/size-info'

import Platform from 'platform';
import BillingWrapper from "./components/messages/billing/billing-wrapper";
import CoursePaymentWrapper from "./components/messages/billing/course-payment-wrapper";
import CookiesMessage from "./components/messages/cookies-popup";

import {getAppOptions, waitingSelector} from 'ducks/app'
import {notifyNewUserRegistered,} from 'ducks/google-analytics'
import ModalWaiting from "./components/messages/modal-waiting";
import ScrollMemoryStorage from "./tools/scroll-memory-storage";

Polyfill.registry();

let _homePath = '/';
const _globalScrollDelta = 80;

class App extends Component {

    constructor(props) {
        super(props);

        this.state = {
            // direction: '',
            lastScrollPos: 0,
            showHeader: true,
            // width: 0,
            // height: 0,
        };

        this._lastScrollPos = 0;

        this._handleScroll = this._handleScroll.bind(this);

        let _isMobile = (Platform.os.family === "Android") || (Platform.os.family === "iOS") || (Platform.os.family === "Windows Phone");
        if (_isMobile) {
            this.props.appActions.setAppTypeMobile()
        }

        this.props.getAppOptions()
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

        if (!(_recoveryRout || _errorRout)) {
            this.props.userActions.whoAmI()
            // this.props.getUserBookmarks()
        }

        this.props.appActions.getCookiesConfimation()
        this.props.getParameters()
        this.props.loadVersion()
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

        this._parseSearch()
    }

    _parseSearch() {
        if (!this.props.location.search) return

        const _params = new URLSearchParams(this.props.location.search),
            _isBilling = _params.get('t') ? _params.get('t') === 'b' : false,
            _isPlayer= _params.get('t') ? _params.get('t') === 'p' : false,
            _isAuth = _params.get('t') ? _params.get('t') === 'a' : false,
            _isNewUser = _params.get('_is_new_user') ? _params.get('_is_new_user') === 'true' : false


        this._scrollPosition = +_params.get('pos');

        if (_isBilling) {
            this.props.history.replace(this.props.location.pathname)

            const _inKey = _params.get('p1'),
                _savedKey = localStorage.getItem('s1'),
                _courseInfo = {
                    productId: +_params.get('productId'),
                    courseId: +_params.get('courseId'),
                    returnUrl: _params.get('returnUrl'),
                    firedByPlayerBlock: _params.get('firedByPlayerBlock') ? _params.get('firedByPlayerBlock') === 'true' : false
                }

            if (_inKey === _savedKey) {
                localStorage.removeItem('s1');
                this.props.setBillingWaitingAuthorizeData(_courseInfo)
            }
        }

        if (_isPlayer) {
            this.props.history.replace(this.props.location.pathname)

            const _inKey = _params.get('p1'),
                _savedKey = localStorage.getItem('s1')

            if (_inKey === _savedKey) {
                localStorage.removeItem('s1');
                this.props.setPlayerWaitingAuthorizeData({returnUrl: _params.get('returnUrl')})
            }
        }

        if (_isAuth) {
            this.props.history.replace(this.props.location.pathname)
        }

        if (this._scrollPosition) {
            ScrollMemoryStorage.setUrlPosition('INIT', this._scrollPosition)
            ScrollMemoryStorage.setKeyActive('INIT')
        }

        if (_isNewUser) {
            this.props.notifyNewUserRegistered()
        }
    }

    componentWillReceiveProps(nextProps) {
        let _thisLocation = this.props.ownProps.location.pathname,
            _nextLocation = nextProps.ownProps.location.pathname,
            _isNewLocation = _thisLocation !== _nextLocation;

        if (_isNewLocation) {
            if (!this.state.showHeader) {
                this.setState({showHeader: true,});
            }

            this.props.appActions.hideUserBlock()
            this.props.getUserPaidCourses()

            if (nextProps.playInfo) {
                let _targetUrl = _homePath + nextProps.playInfo.courseUrl + '/' + nextProps.playInfo.lessonUrl;
                if (nextProps.ownProps.location.pathname !== _targetUrl) {
                    this.props.appActions.switchToSmallPlayer()
                    // todo : Очистку аудио надо убрать, когда действительно будет переключение на маленький плеер
                    // this.props.playerStartActions.clearAudios()
                }
            }
        }


        if ((!this.props.showFeedbackWindow && !this.props.showFeedbackResultMessage) && (nextProps.showFeedbackWindow || nextProps.showFeedbackResultMessage)) {
            $('body').addClass('modal-open')
        }

        if ((this.props.showFeedbackWindow || this.props.showFeedbackResultMessage) && (!nextProps.showFeedbackWindow && !nextProps.showFeedbackResultMessage)) {
            $('body').removeClass('modal-open')
        }

        if ((this.props.location.search !== '?play') && (nextProps.location.search === '?play')) {
            scroll()
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (!this.state.showHeader && prevState.showHeader) {
            this.props.appActions.hideUserBlock()
        }

        let _thisLocation = this.props.ownProps.location.pathname,
            _prevLocation = prevProps.ownProps.location.pathname,
            _isNewLocation = _thisLocation !== _prevLocation;

        if (_isNewLocation) {
            this.props.appActions.changePage(_thisLocation);
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

        let _bellowScreen = event.target.scrollingElement.scrollTop > window.innerHeight;

        let _scrollDelta = _bellowScreen ? _globalScrollDelta / 2 : _globalScrollDelta;

        let _delta = Math.abs(this.state.lastScrollPos - event.target.scrollingElement.scrollTop);
        if (_delta < _scrollDelta) {
            return
        }

        let _header = $('.page-header._fixed');
        if (_header && _header.length > 0) {
            if (_bellowScreen) {
                _header.css("-webkit-transition", "all 0.2s ease")
                _header.css("transition", "all 0.2s ease")
            } else {
                _header.css("-webkit-transition", "all 0.4s ease")
                _header.css("transition", "all 0.4s ease")
            }
        }

        let _newScrollTop = event.target.scrollingElement.scrollTop

        if ((_newScrollTop < _scrollDelta) && (!this.state.showHeader)) {
            this.setState({showHeader: true})
        }

        if ((_newScrollTop > 0) && (this._lastScrollPos > _newScrollTop)) {
            this._lastScrollPos = _newScrollTop
            if (!this.state.showHeader) {
                this.setState({ showHeader: true, });
            }
        } else if (this._lastScrollPos < _newScrollTop) {
            this._lastScrollPos = _newScrollTop
            if (this.state.showHeader) {
                this.setState({ showHeader: false, });
            }
        }
    }

    _getMainDiv() {
        return (
            <Switch >
                <Route exact path={_homePath} component={CoursePage}/>
                <Route exact path={_homePath + 'razdel/:filter'}
                       render={(props) => (<CoursePage {...props} hasExternalFilter={true}/>)}/>
                <Route path={_homePath + 'activation-confirm/:activationKey'} component={AuthConfirmForm}/>
                <Route path={_homePath + 'auth/error'} component={AuthErrorForm}/>
                <Route path={_homePath + 'profile'} component={ProfilePage}/>
                <Route path={_homePath + 'subscription'} component={ProfilePage}/>
                <Route path={_homePath + 'history'} component={ProfilePage}/>
                <Route path={_homePath + 'favorites'} component={BookmarksPage}/>
                <Route path={_homePath + 'favorites/courses'} component={BookmarksPage}/>
                <Route path={_homePath + 'favorites/lessons'} component={BookmarksPage}/>
                <Route path={_homePath + 'recovery/:activationKey'} component={PasswordConfirmForm}/>
                <Route path={_homePath + 'category/:url/:garbage'} component={NotFound}/>
                <Route path={_homePath + 'category/:url'} component={SingleCoursePage}/>
                <Route path={_homePath + 'autor/:url/:garbage'} component={NotFound}/>
                <Route path={_homePath + 'autor/:url'} component={AuthorPage}/>
                <Route path={_homePath + ':courseUrl/:lessonUrl/:garbage'} component={NotFound}/>
                <Route path={_homePath + ':courseUrl/:lessonUrl'} component={CombineLessonPage}/>
                <Route path={_homePath + 'about'} component={ProjectPage}/>
                <Route path={_homePath + 'purchases'} component={PurchasesPage}/>
                <Route path="*" component={NotFound}/>
            </Switch>
        )
    }

    _addDevWarn(text) {
        let _dev = $('#dev'),
            isVisible = _dev.is(':visible');

        if (isVisible === true) {
            _dev.append($('<div style="position:  relative; color:darkgreen">' + text + '</div>'))
        }
    }

    render() {
        let {
            // sendPulseScript,
            showSignInForm,
            showSizeInfo,
            showFeedbackWindow,
            showFeedbackResultMessage,
            isWaiting
        } = this.props;

        return <div className="App global-wrapper" onScroll={this._handleScroll}>
                <PageHeader visible={this.state.showHeader}/>
                <SmallPlayer/>
                {this._getMainDiv()}
                <PageFooter/>
                <AuthPopup visible={showSignInForm}/>
                {showSizeInfo ? <SizeInfo/> : null}
                {showFeedbackWindow ? <FeedbackMessageBox/> : null}
                {showFeedbackResultMessage ? <FeedbackResultMessage/> : null}
                <BillingWrapper/>
                <CoursePaymentWrapper/>
                <CookiesMessage/>
                <ModalWaiting visible={isWaiting}/>
            </div>

    }
}

// sendPulseScript ?
//     <MetaTags>
//         <script charSet="UTF-8" src={sendPulseScript} async/>
//     </MetaTags>
//     :
//     null,

function mapStateToProps(state, ownProps) {
    return {
        showFiltersForm: state.pageHeader.showFiltersForm,
        currentPage: state.pageHeader.currentPage,
        size: state.app.size,
        sendPulseScript: state.app.sendPulseScript,
        showSizeInfo: state.app.showSizeInfo,
        playInfo: state.player.playingLesson,
        showSignInForm: state.app.showSignInForm,
        showFeedbackWindow: showFeedbackWindowSelector(state),
        showFeedbackResultMessage: showFeedbackResultMessageSelector(state),
        isWaiting: waitingSelector(state),
        ownProps,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        appActions: bindActionCreators(appActions, dispatch),
        userActions: bindActionCreators(userActions, dispatch),
        playerActions: bindActionCreators(playerActions, dispatch),
        playerStartActions: bindActionCreators(playerStartActions, dispatch),
        getUserBookmarks: bindActionCreators(getUserBookmarks, dispatch),
        getParameters: bindActionCreators(getParameters, dispatch),
        getUserPaidCourses: bindActionCreators(getUserPaidCourses, dispatch),
        loadVersion: bindActionCreators(loadVersion, dispatch),
        getAppOptions: bindActionCreators(getAppOptions, dispatch),
        setBillingWaitingAuthorizeData: bindActionCreators(setBillingWaitingAuthorizeData, dispatch),
        setPlayerWaitingAuthorizeData: bindActionCreators(setPlayerWaitingAuthorizeData, dispatch),
        notifyNewUserRegistered: bindActionCreators(notifyNewUserRegistered, dispatch),
    }
}

export default hot(withRouter(connect(mapStateToProps, mapDispatchToProps)(App)))
