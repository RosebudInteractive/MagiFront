import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import PropTypes from 'prop-types'
import MetaTags from 'react-meta-tags';

import NotFoundPage from '../components/not-found';
import LoadingFrame from '../components/loading-frame';
import {getDomain, getPageUrl, pages} from "tools/page-tools";

import {refreshState as refreshStorage} from "actions/lesson-info-storage-actions";
import {whoAmI} from "actions/user-actions";
import {setCurrentPage as headerSetPage} from "actions/page-header-actions";
import {getCourse, getCourses} from "actions/courses-page-actions";
import $ from "jquery";
import {facebookAppIdSelector, clearCurrentPage, setCurrentPage} from "ducks/app";
import {testSelector, loadingSelector as testLoading, getTest} from "ducks/test";
import ScrollMemoryStorage from "tools/scroll-memory-storage";

import '../components/test-page/test-page.sass'
import CoverWrapper from "../components/test-page/cover";
import InstanceWrapper from "../components/test-page/instance";
import {TEST_PAGE_TYPE} from "../constants/common-consts";
// import {test} from "../components/test-page/mock-data";
import Header from "../components/header-lesson-page";


class TestPage extends React.Component {

    static propTypes = {
        type: PropTypes.string,
    }

    componentWillMount() {
        window.scrollTo(0, 0)
        this.props.whoAmI()
        this.props.refreshStorage();
        this.props.getCourses();
        // this.props.getCourse(this.props.courseUrl);
        this.props.headerSetPage(pages.test);
        this.props.getTest(this.props.testUrl)
    }

    componentDidMount() {
        this.props.setCurrentPage(this);
    }

    componentDidUpdate(prevProps) {
        if (this.props.test) {
            document.title = 'Тест: ' + this.props.test.Name + ' - Магистерия'
        }

        if (prevProps.fetching && !this.props.fetching) {
            const _key = this.props.location.key;
            ScrollMemoryStorage.scrollPage(_key)
        }
    }

    componentWillUnmount() {
        TestPage._removeMetaTags();
        this.props.clearCurrentPage();
    }

    render() {
        let {fetching, notFound, test} = this.props;

        return fetching ?
            <LoadingFrame/>
            :
            notFound ?
                <NotFoundPage/>
                :
                <div className="test-page">
                    {this._getMetaTags()}
                    <Header test={test}/>
                    {this._getWrapper()}
                </div>

    }

    _getWrapper() {
        let {course, test, type} = this.props;
        // let {course, type} = this.props;

        switch (type) {
            case TEST_PAGE_TYPE.TEST :
                return <CoverWrapper test={test}/>

            case TEST_PAGE_TYPE.INSTANCE:
                return <InstanceWrapper test={test}/>

            case TEST_PAGE_TYPE.RESULT:
                return <CoverWrapper test={test}/>

            default:
                return <CoverWrapper test={test}/>
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
                <meta property="og:title" content={test.Name}/>
                <meta property="og:description" content={test.Description}/>
                <meta property="og:url" content={_url}/>
                <meta property="og:site_name" content="Магистерия"/>
                <meta property="fb:app_id" content={facebookAppID}/>
                {
                    test.PageMeta && test.PageMeta.Images && test.PageMeta.Images.og
                        &&
                        [
                            <meta property="og:image" content={_imagePath + test.PageMeta.Images.og.FileName}/>,
                            <meta property="og:image:secure_url"
                                  content={_imagePath + test.PageMeta.Images.og.FileName}/>,
                            <meta property="og:image:width" content={_getWidth(test.PageMeta.Images.og.MetaData)}/>,
                            <meta property="og:image:height" content={_getHeight(test.PageMeta.Images.og.MetaData)}/>
                        ]
                }
                <meta name="twitter:card" content="summary_large_image"/>
                <meta name="twitter:title" content={test.PageMeta.Name ? test.PageMeta.Name : test.Name}/>
                <meta name="twitter:description" content={test.PageMeta.Description ? test.PageMeta.Description : test.Description}/>
                <meta name="twitter:site" content="@MagisteriaRu"/>
                {
                    test.PageMeta && test.PageMeta.Images && test.PageMeta.Images.twitter
                        &&
                        <meta name="twitter:image" content={_imagePath + test.PageMeta.Images.twitter.FileName}/>
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
}

function mapStateToProps(state, ownProps) {
    return {
        courseUrl: ownProps.match.params.courseUrl,
        testUrl: ownProps.match.params.testUrl,
        facebookAppID: facebookAppIdSelector(state),
        fetching: testLoading(state) ||
            // state.singleCourse.fetching ||
            state.user.loading ||
            state.courses.fetching,

        course: state.singleCourse.object,
        test: testSelector(state)
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        getTest,
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