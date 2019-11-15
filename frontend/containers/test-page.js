import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import PropTypes from 'prop-types'
import MetaTags from 'react-meta-tags';

import NotFoundPage from '../components/not-found';
import LoadingFrame from '../components/loading-frame';
import {getDomain, getPageUrl, isMobilePlatform, pages} from "tools/page-tools";

import {refreshState as refreshStorage} from "actions/lesson-info-storage-actions";
import {whoAmI} from "actions/user-actions";
import {setCurrentPage as headerSetPage} from "actions/page-header-actions";
import {getCourse, getCourses} from "actions/courses-page-actions";
import $ from "jquery";
import {facebookAppIdSelector, clearCurrentPage, setCurrentPage} from "ducks/app";
import {testSelector, loadingSelector as testLoading, getTest,} from "ducks/test";
import {loadingSelector as testInstanceLoading, getTestInstance} from "ducks/test-instance";
import {loadingSelector as testResultLoading, getTestResult} from "ducks/test-result";
import ScrollMemoryStorage from "tools/scroll-memory-storage";

import '../components/test-page/test-page.sass'
import Cover from "../components/test-page/cover";
import Instance from "../components/test-page/instance";
import ResultCover from "../components/test-page/result/cover";
import {TEST_PAGE_TYPE} from "../constants/common-consts";
import Header from "../components/header-lesson-page";
import {Desktop, Mobile} from "tools/cover";
import Answers from "../components/test-page/result/answers";

class TestPage extends React.Component {

    static propTypes = {
        type: PropTypes.string,
    }

    constructor(props) {
        super(props)

        this.state = {
            isMobile: isMobilePlatform(),
            isLandscape: true
        }

        this._resizeHandler = function () {
            let _div = $('.test-page'),
                _content = $('.js-test-content'),
                _wrapper = $('.test-page__content')

            if (!_content || !_content.length || !_wrapper || !_wrapper.length) return

            if (this._isLandscape()) {
                if (!this.state.isLandscape) {
                    this.setState({isLandscape: true})
                }
                _div.removeClass('added')
                this._height = this._getHeight();
                this._width = this._getWidth();
                _wrapper.css('min-height', this._height).css('width', this._width);
            } else {
                if (this.state.isLandscape) {
                    this.setState({isLandscape: false})
                }

                _wrapper.css('min-height', "").css('width', "");

                _div.addClass('added')
            }

            // if (_content && (_content.length > 0)) {
            //     let _contentHeight = _content.outerHeight()
            //
            //     _wrapper.css("height", "")
            //
            //     let _wrapperHeight = _wrapper.height()
            //
            //     if (_contentHeight >= _wrapperHeight) {
            //         _wrapper.css("height", _contentHeight)
            //     }
            // }
        }.bind(this)

        this._addEventListeners();
    }

    componentWillMount() {
        window.scrollTo(0, 0)
        this.props.whoAmI()
        this.props.refreshStorage();
        this.props.getCourses();
        // this.props.getCourse(this.props.courseUrl);
        this.props.headerSetPage(pages.test);
        // this.props.getTest(this.props.testUrl)

        switch (this.props.type) {
            case TEST_PAGE_TYPE.TEST: {
                this.props.getTest(this.props.testUrl)
                return
            }

            case TEST_PAGE_TYPE.INSTANCE: {
                this.props.getTestInstance(this.props.testUrl)
                return
            }

            case TEST_PAGE_TYPE.RESULT: {
                this.props.getTestResult(this.props.testUrl)
                return
            }

            default:
                return;

        }
    }

    componentDidMount() {
        this.props.setCurrentPage(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.type !== this.props.type) {
            switch (nextProps.type) {
                case TEST_PAGE_TYPE.TEST: {
                    this.props.getTest(nextProps.testUrl)
                    return
                }

                case TEST_PAGE_TYPE.INSTANCE: {
                    this.props.getTestInstance(nextProps.testUrl)
                    return
                }

                case TEST_PAGE_TYPE.RESULT: {
                    this.props.getTestResult(nextProps.testUrl)
                    return
                }

                default:
                    return;

            }

        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.test) {
            document.title = 'Тест: ' + this.props.test.Name + ' - Магистерия'
        }

        if (prevProps.fetching && !this.props.fetching) {
            const _key = this.props.location.key;
            ScrollMemoryStorage.scrollPage(_key)
            this._resizeHandler();
        }
    }

    componentWillUnmount() {
        TestPage._removeMetaTags();
        this.props.clearCurrentPage();
        this._removeEventListeners();
    }

    render() {
        let {fetching, notFound, test, course, type} = this.props,
            _className = "test-page" +
                (this.state.isMobile ? " _mobile" : " _desktop") +
                (type === TEST_PAGE_TYPE.INSTANCE ? " _instance-page" : "")

        return fetching ?
            <LoadingFrame/>
            :
            notFound ?
                <NotFoundPage/>
                :
                <div className={_className}>
                    {this._getMetaTags()}
                    <Header test={test} course={course}/>
                    <div className="test-page__content">
                        <div className="content-wrapper">
                            {this._getContent()}
                        </div>
                    </div>
                    {type === TEST_PAGE_TYPE.RESULT && <Answers/>}
                </div>

    }

    _getContent() {
        let {type} = this.props;

        switch (type) {
            case TEST_PAGE_TYPE.TEST :
                return <Cover/>

            case TEST_PAGE_TYPE.INSTANCE:
                return <Instance/>

            case TEST_PAGE_TYPE.RESULT:
                return <ResultCover/>

            default:
                return <Cover/>
        }
    }

    reload() {
        // let {courseUrl, lessonUrl} = this.props;
        //
        // this.props.userActions.whoAmI();
        // this.props.storageActions.refreshState();
        //
        // this.props.lessonActions.getLesson(courseUrl, lessonUrl);
        // this.props.lessonActions.getLessonsAll(courseUrl, lessonUrl);
        // this.props.lessonActions.getLessonText(courseUrl, lessonUrl);
    }

    _getMetaTags() {
        let {test, facebookAppID} = this.props,
            _url = getPageUrl(),
            _domain = getDomain(),
            _imagePath = _domain + '/data/';

        let _getWidth = (meta) => {
            let _data = JSON.parse(meta);

            return _data ? _data.size.width : 0
        }

        let _getHeight = (meta) => {
            let _data = JSON.parse(meta);

            return _data ? _data.size.height : 0
        }

        TestPage._removeRobotsMetaTags()

        return test
            &&
            <MetaTags>
                <meta name="description" content={"Test"}/>
                <link rel="canonical" href={_url}/>
                <meta property="og:locale" content="ru_RU"/>
                <meta property="og:type" content="article"/>
                <meta property="og:title" content={test.SnName ? test.SnName : test.Name}/>
                { test.SnDescription && <meta property="og:description" content={test.SnDescription}/> }
                <meta property="og:url" content={_url}/>
                <meta property="og:site_name" content="Магистерия"/>
                <meta property="fb:app_id" content={facebookAppID}/>
                {
                    test.Images && test.Images.og
                        &&
                        [
                            <meta property="og:image" content={_imagePath + test.Images.og.FileName}/>,
                            <meta property="og:image:secure_url"
                                  content={_imagePath + test.Images.og.FileName}/>,
                            <meta property="og:image:width" content={_getWidth(test.Images.og.MetaData)}/>,
                            <meta property="og:image:height" content={_getHeight(test.Images.og.MetaData)}/>
                        ]
                }
                <meta name="twitter:card" content="summary_large_image"/>
                <meta name="twitter:title" content={test.SnName ? test.SnName : test.Name}/>
                { test.SnDescription && <meta name="twitter:description" content={test.SnDescription}/> }
                <meta name="twitter:site" content="@MagisteriaRu"/>
                {
                    test.Images && test.Images.twitter
                        &&
                        <meta name="twitter:image" content={_imagePath + test.Images.twitter.FileName}/>
                }
                <meta name="twitter:creator" content="@MagisteriaRu"/>
                <meta name="apple-mobile-web-app-title" content="Magisteria"/>
                <meta name="application-name" content="Magisteria"/>
            </MetaTags>
    }

    static _removeRobotsMetaTags() {
        $('meta[name="robots"]').remove();
        $('meta[name="prerender-status-code"]').remove();
    }

    static _removeMetaTags() {
        $('meta[name="description"]').remove();
        $('link[rel="canonical"]').remove();
        $('meta[property="og:locale"]').remove();
        $('meta[property="og:type"]').remove();
        $('meta[property="og:title"]').remove();
        $('meta[property="og:description"]').remove();
        $('meta[property="og:url"]').remove();
        $('meta[property="og:site_name"]').remove();
        $('meta[property="fb:app_id"]').remove();
        $('meta[property="og:image"]').remove();
        $('meta[property="og:image:secure_url"]').remove();
        $('meta[name="twitter:card"]').remove();
        $('meta[name="twitter:description"]').remove();
        $('meta[name="twitter:title"]').remove();
        $('meta[name="twitter:site"]').remove();
        $('meta[name="twitter:image"]').remove();
        $('meta[name="apple-mobile-web-app-title"]').remove();
        $('meta[name="application-name"]').remove();
        $('meta[name="robots"]').remove();
        $('meta[name="prerender-status-code"]').remove();
    }

    _addEventListeners() {
        $(window).bind('resize', this._resizeHandler)
    }

    _removeEventListeners() {
        $(window).unbind('resize', this._resizeHandler)
    }

    _isLandscape() {
        return this.state.isMobile ? Mobile.isLandscape() : Desktop.isLandscape()
    }

    _getHeight() {
        return this.state.isMobile ? Mobile.getLandscapeHeight() : Desktop.getLandscapeHeight()
    }

    _getWidth() {
        return this.state.isMobile ? Mobile.getLandscapeWidth() : Desktop.getLandscapeWidth()
    }
}

function mapStateToProps(state, ownProps) {
    return {
        courseUrl: ownProps.match.params.courseUrl,
        testUrl: ownProps.match.params.testUrl,
        facebookAppID: facebookAppIdSelector(state),
        fetching: testLoading(state) ||
            testInstanceLoading(state) ||
            testResultLoading(state) ||
            state.singleCourse.fetching ||
            state.user.loading ||
            state.courses.fetching,

        course: state.singleCourse.object,
        test: testSelector(state)
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        getTest,
        getTestInstance,
        getTestResult,
        getCourse,
        getCourses,
        whoAmI,
        refreshStorage,
        headerSetPage,
        setCurrentPage,
        clearCurrentPage
    }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(TestPage)