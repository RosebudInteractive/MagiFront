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
import TestPage from './containers/test-page'
import TestResultPreview from './containers/test-result-preview'
import SearchPage from './containers/search-page'
import EmptyPromoPage from './components/empty-promo-page'
import TestResultSharePage from './components/test-result-share-page'

import PageHeader from './components/header-ver2';
import PageFooter from './components/page-footer/page-footer';
import FeedbackMessageBox from './components/messages/feedback';
import FeedbackResultMessage from './components/messages/feedback-result-message';

import * as appActions from './actions/app-actions';
import * as userActions from './actions/user-actions';
import * as playerActions from './actions/player-actions';
import * as playerStartActions from './actions/player-start-actions';
import {getUserBookmarks, getUserPaidCourses} from "./ducks/profile";
import {getParameters} from "./ducks/params";
import {setWaitingAuthorizeData as setBillingWaitingAuthorizeData,} from "./ducks/billing";
import {setWaitingAuthorizeData as setPlayerWaitingAuthorizeData,} from "./ducks/player";
import {setWaitingAuthorizeData as setTestWaitingAuthorizeData,} from "./ducks/test-instance";
import {showFeedbackWindowSelector, showModalErrorMessage} from "./ducks/message";
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

import BillingWrapper from "./components/messages/billing/subscription-window";
// import CoursePaymentWrapper from "./components/messages/billing/course-payment-window";
import CoursePaymentWrapper from "./components/messages/billing-ver-2";
import CookiesMessage from "./components/messages/cookies-popup";

import {getAppOptions, pageChanged, waitingSelector} from 'ducks/app'
import {notifyNewUserRegistered,} from 'ducks/google-analytics'
import ModalWaiting from "./components/messages/modal-waiting";
import ScrollMemoryStorage from "./tools/scroll-memory-storage";
import {isMobilePlatform} from "./tools/page-tools";
import {FILTER_TYPE, TEST_PAGE_TYPE} from "./constants/common-consts";
import {scrollGuardSelector, disableScrollGuard} from "ducks/filters";
import {callbackPayment} from "./tools/payments-checker"
import "./tools/fonts.sass"
import "./tools/system.sass"
import ReviewWindow from "./components/messages/review";
import ReviewResultMessage from "./components/messages/review/result-message";
import CourseDiscounts from "tools/course-discount";

Polyfill.registry();

let _homePath = '/';
const GLOBAL_SCROLL_DELTA = 80;

class App extends Component {

    constructor(props) {
        super(props);

        this.state = {
            lastScrollPos: 0,
            showHeader: true,
        };

        this._lastScrollPos = 0;

        this._handleScroll = this._handleScroll.bind(this);

        if (isMobilePlatform()) {
            this.props.appActions.setAppTypeMobile()
        }

        this.props.getAppOptions()
        window.callback_payment = callbackPayment
    }

    componentWillMount() {
        let _errorRout = this.props.location.pathname.startsWith('/auth/error'),
            _recoveryRout = this.props.location.pathname.startsWith('/recovery')

        if (!(_recoveryRout || _errorRout)) {
            this.props.userActions.whoAmI()
        }

        this.props.appActions.getCookiesConfimation()
        this.props.getParameters()
        this.props.loadVersion()
    }

    componentDidMount() {
        window.addEventListener('scroll', this._handleScroll);

        this.props.playerActions.startInit()

        this._parseSearch()
    }

    _parseSearch() {
        if (!this.props.location.search) return

        const _params = new URLSearchParams(this.props.location.search),
            _isBilling = _params.get('t') ? _params.get('t') === 'b' : false,
            _isPlayer= _params.get('t') ? _params.get('t') === 'p' : false,
            _isTest = _params.get('t') ? _params.get('t') === 't' : false,
            _isAuth = _params.get('t') ? _params.get('t') === 'a' : false,
            _isNewUser = _params.get('_is_new_user') ? _params.get('_is_new_user') === 'true' : false,
            _message = _params.get('message')

        this._scrollPosition = +_params.get('pos');

        if (_isBilling) {
            this.props.history.replace(this.props.location.pathname)

            const _inKey = _params.get('p1'),
                _savedKey = localStorage.getItem('s1'),
                _courseInfo = {
                    productId: +_params.get('productId'),
                    courseId: +_params.get('courseId'),
                    returnUrl: _params.get('returnUrl'),
                    buyAsGift: _params.get('buyAsGift') ? _params.get('buyAsGift') === 'true' : false,
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

        if (_isTest) {
            this.props.history.replace(this.props.location.pathname)

            const _inKey = _params.get('p1'),
                _savedKey = localStorage.getItem('s1')

            if (_inKey === _savedKey) {
                localStorage.removeItem('s1');
                this.props.setTestWaitingAuthorizeData(_params.get('url'))
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

        if (_message) {
            let _error = new Error(_message)

            _error.messageTitle = "Ошибка авторизации"
            this.props.showModalErrorMessage(_error)
        }

        if (CourseDiscounts.checkDynamicDiscountInURL(_params)) {
            let _sParams = _params.toString()

            this.props.history.replace(this.props.location.pathname + (_sParams ? `?${_sParams}` : ""))
        }
    }

    componentWillReceiveProps(nextProps) {
        let _thisLocation = this.props.ownProps.location.pathname,
            _nextLocation = nextProps.ownProps.location.pathname,
            _isNewLocation = _thisLocation !== _nextLocation;

        if (_isNewLocation) {
            if (!this.state.showHeader && !this.props.filterScrollGuard) {
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
            this.props.pageChanged()
            this._lastScrollPos = (document.scrollingElement) ? document.scrollingElement.scrollTop : 0
        }
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this._handleScroll);
    }

    _handleScroll(event) {
        const DIRECTION = {TOP: 1, BOTTOM: 2}

        if (!event.target.scrollingElement) {
            return
        }

        let _delta = this._lastScrollPos - event.target.scrollingElement.scrollTop,
            _direction = (_delta > 0) ? DIRECTION.BOTTOM : DIRECTION.TOP,
            _scrollDelta = (_direction === DIRECTION.BOTTOM) ? GLOBAL_SCROLL_DELTA : GLOBAL_SCROLL_DELTA / 3;

        let _needHandle = (_direction === DIRECTION.BOTTOM) && (this._lastScrollPos < GLOBAL_SCROLL_DELTA)

        _delta = Math.abs(_delta)
        if ((_delta < _scrollDelta) && !_needHandle) {
            return
        }

        let _newScrollTop = event.target.scrollingElement.scrollTop

        if (this.props.filterScrollGuard) {
            this.props.disableScrollGuard()
            return
        }

        if ((this._lastScrollPos === 0) && (_direction === DIRECTION.TOP)) {
            this._lastScrollPos = _newScrollTop
            return;
        }

        if ((_newScrollTop < _scrollDelta) && (_direction === DIRECTION.BOTTOM) && (!this.state.showHeader)) {
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
                <Route exact path={_homePath}
                       render={(props) => (<CoursePage {...props} hasExternalFilter={false} filterType={FILTER_TYPE.EMPTY}/>)}/>
                <Route path={_homePath + 'razdel/:filter'}
                       render={(props) => (<CoursePage {...props} hasExternalFilter={true} filterType={FILTER_TYPE.RAZDEL}/>)}/>
                <Route path={_homePath + 'razdel_ext/:filter'}
                       render={(props) => (<CoursePage {...props} hasExternalFilter={true} filterType={FILTER_TYPE.RAZDEL_REVERSE}/>)}/>
                <Route path={_homePath + 'knowledge/:filter'}
                       render={(props) => (<CoursePage {...props} hasExternalFilter={true} filterType={FILTER_TYPE.KNOWLEDGE}/>)}/>
                <Route path={_homePath + 'knowhow/:filter'}
                       render={(props) => (<CoursePage {...props} hasExternalFilter={true} filterType={FILTER_TYPE.KNOWHOW}/>)}/>
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
                <Route path={_homePath + 'test/:testUrl'} render={(props) => (<TestPage {...props} type={TEST_PAGE_TYPE.TEST}/>)}/>
                <Route path={_homePath + 'test-instance/:testUrl'} render={(props) => (<TestPage {...props} type={TEST_PAGE_TYPE.INSTANCE}/>)}/>
                <Route path={_homePath + 'test-result/:code'} render={(props) => (<TestResultSharePage {...props} type={TEST_PAGE_TYPE.RESULT}/>)}/>
                <Route path={_homePath + 'test-result-preview/:instanceId'} component={TestResultPreview}/>
                <Route path={_homePath + 'promo/:code'} component={EmptyPromoPage}/>
                <Route path={_homePath + ':courseUrl/:lessonUrl/:garbage'} component={NotFound}/>
                <Route path={_homePath + ':courseUrl/:lessonUrl'} component={CombineLessonPage}/>
                <Route path={_homePath + 'about'} component={ProjectPage}/>
                <Route path={_homePath + 'purchases'} component={PurchasesPage}/>
                <Route path={`${_homePath}search`} component={SearchPage}/>
                <Route path="*" component={NotFound}/>
            </Switch>
        )
    }

    render() {
        let {
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
                <ReviewWindow/>
                <ReviewResultMessage/>
                <BillingWrapper/>
                <CoursePaymentWrapper/>
                <CookiesMessage/>
                <ModalWaiting visible={isWaiting}/>
            </div>

    }
}

function mapStateToProps(state, ownProps) {
    return {
        size: state.app.size,
        sendPulseScript: state.app.sendPulseScript,
        showSizeInfo: state.app.showSizeInfo,
        playInfo: state.player.playingLesson,
        showSignInForm: state.app.showSignInForm,
        showFeedbackWindow: showFeedbackWindowSelector(state),
        showFeedbackResultMessage: showFeedbackResultMessageSelector(state),
        isWaiting: waitingSelector(state),
        filterScrollGuard: scrollGuardSelector(state),
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
        setTestWaitingAuthorizeData: bindActionCreators(setTestWaitingAuthorizeData, dispatch),
        notifyNewUserRegistered: bindActionCreators(notifyNewUserRegistered, dispatch),
        showModalErrorMessage: bindActionCreators(showModalErrorMessage, dispatch),
        disableScrollGuard: bindActionCreators(disableScrollGuard, dispatch),
        pageChanged: bindActionCreators(pageChanged, dispatch),
    }
}

export default hot(withRouter(connect(mapStateToProps, mapDispatchToProps)(App)))
