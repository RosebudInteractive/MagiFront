import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import MetaTags from 'react-meta-tags';

import NotFoundPage from '../components/not-found';
import LoadingFrame from '../components/loading-frame';
import {getDomain, getPageUrl, pages} from "tools/page-tools";

import {refreshState as refreshStorage} from "actions/lesson-info-storage-actions";
import {whoAmI} from "actions/user-actions";
import {setCurrentPage as headerSetPage} from "actions/page-header-actions";
import $ from "jquery";
import {facebookAppIdSelector, clearCurrentPage, setCurrentPage} from "ducks/app";
import ScrollMemoryStorage from "tools/scroll-memory-storage";
import Wrapper from "../components/test-page";

class TestPage extends React.Component {
    componentWillMount() {
        window.scrollTo(0, 0)
        this.props.whoAmI()
        this.props.refreshStorage();
        // this.props.coursesActions.getCourses();
        // this.props.coursesActions.getCourse(this.props.courseUrl);
        this.props.headerSetPage(pages.test);
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

    render() {
        let {test, fetching, notFound,} = this.props;

        return fetching ?
            <LoadingFrame/>
            :
            notFound ?
                <NotFoundPage/>
                :
                test && <React.Fragment>
                    {this._getMetaTags()}
                    <Wrapper test={test}/>
                </React.Fragment>
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

        this._removeRobotsMetaTags()

        return course
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
                {/*{*/}
                {/*    course.PageMeta && course.PageMeta.Images && course.PageMeta.Images.og*/}
                {/*        ?*/}
                {/*        [*/}
                {/*            <meta property="og:image" content={_imagePath + course.PageMeta.Images.og.FileName}/>,*/}
                {/*            <meta property="og:image:secure_url"*/}
                {/*                  content={_imagePath + course.PageMeta.Images.og.FileName}/>,*/}
                {/*            <meta property="og:image:width" content={_getWidth(course.PageMeta.Images.og.MetaData)}/>,*/}
                {/*            <meta property="og:image:height" content={_getHeight(course.PageMeta.Images.og.MetaData)}/>*/}
                {/*        ]*/}
                {/*        :*/}
                {/*        null*/}
                {/*}*/}
                <meta name="twitter:card" content="summary_large_image"/>
                {/*<meta name="twitter:title" content={course.PageMeta.Name ? course.PageMeta.Name : course.Name}/>*/}
                {/*<meta name="twitter:description" content={course.PageMeta.Description ? course.PageMeta.Description : course.Description}/>*/}
                <meta name="twitter:site" content="@MagisteriaRu"/>
                {/*{*/}
                {/*    course.PageMeta && course.PageMeta.Images && course.PageMeta.Images.twitter*/}
                {/*        ?*/}
                {/*        <meta name="twitter:image" content={_imagePath + course.PageMeta.Images.twitter.FileName}/>*/}
                {/*        :*/}
                {/*        null*/}
                {/*}*/}
                <meta name="twitter:creator" content="@MagisteriaRu"/>
                <meta name="apple-mobile-web-app-title" content="Magisteria"/>
                <meta name="application-name" content="Magisteria"/>
            </MetaTags>
    }

    _removeRobotsMetaTags() {
        $('meta[name="robots"]').remove();
        $('meta[name="prerender-status-code"]').remove();
    }

    _removeMetaTags() {
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

    componentWillUnmount() {
        this._removeMetaTags();
        this.props.clearCurrentPage();
    }
}

function mapStateToProps(state, ownProps) {
    return {
        testId: ownProps.match.params.testId,
        facebookAppID: facebookAppIdSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({whoAmI, refreshStorage, headerSetPage, setCurrentPage, clearCurrentPage}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(TestPage)