import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import MetaTags from 'react-meta-tags';

import InfoBlock from '../components/course-page-ver1/content/info-block/'
import Content from '../components/course-extended/content-extended';
import Tabs from '../components/course-extended/tabs';
import NotFoundPage from '../components/not-found';
import LoadingFrame from '../components/loading-frame';

import * as coursesActions from '../actions/courses-page-actions';
import * as pageHeaderActions from '../actions/page-header-actions';
import * as storageActions from '../actions/lesson-info-storage-actions';
import * as userActions from "../actions/user-actions";
import PropTypes from 'prop-types';

import $ from 'jquery'

import {pages, getDomain, getPageUrl,} from '../tools/page-tools';
import { addCourseToBookmarks, userBookmarksSelector, removeCourseFromBookmarks, } from "ducks/profile";
import {enabledPaidCoursesSelector, facebookAppIdSelector, setCurrentPage, clearCurrentPage} from "ducks/app";
import {notifyConcreteCourseShowed} from "ducks/google-analytics";

import {getCrownForCourse} from "../tools/svg-paths"
import ScrollMemoryStorage from "../tools/scroll-memory-storage"
import VideoBlock from "../components/course-page-ver1/video-block";

import WrapperVer1 from '../components/course-page-ver1/index'
import WrapperVer2 from '../components/course-page-ver2/index'

class Main extends React.Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        window.scrollTo(0, 0)
        this.props.userActions.whoAmI()
        this.props.storageActions.refreshState();
        this.props.coursesActions.getCourse(this.props.courseUrl);
        this.props.pageHeaderActions.setCurrentPage(pages.singleCourse);
    }

    componentDidUpdate(prevProps) {
        if (this.props.course) {
            document.title = 'Курс: ' + this.props.course.Name + ' - Магистерия'
        }

        if (prevProps.fetching && !this.props.fetching) {
            const _key = this.props.location.key;
            ScrollMemoryStorage.scrollPage(_key)
            this.props.notifyConcreteCourseShowed(this.props.course)
        }
    }

    componentDidMount() {
        this.props.setCurrentPage(this);
    }

    reload() {
        this.props.userActions.whoAmI()
        this.props.storageActions.refreshState();
        this.props.coursesActions.getCourse(this.props.courseUrl);
    }

    componentWillUnmount() {
        this._removeMetaTags();
        this.props.clearCurrentPage();
    }

    _favoritesClick() {
        if (!this.props.authorized) {
            this.props.userActions.showSignInForm();
        } else {
            if (this._isCourseInBookmarks()) {
                this.props.removeCourseFromBookmarks(this.props.courseUrl)
            } else {
                this.props.addCourseToBookmarks(this.props.courseUrl)
            }
        }
    }

    _isCourseInBookmarks() {
        return this.props.bookmarks && this.props.bookmarks.find((item) => {
            return item === this.props.courseUrl
        })
    }

    _getMetaTags() {
        let {course, facebookAppID} = this.props,
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
            ?
            <MetaTags>
                <meta name="description" content={course.PageMeta.Post ? course.PageMeta.Post : course.Description}/>
                <link rel="canonical" href={_url}/>
                <meta property="og:locale" content="ru_RU"/>
                <meta property="og:type" content="article"/>
                <meta property="og:title" content={course.PageMeta.Name ? course.PageMeta.Name : course.Name}/>
                <meta property="og:description" content={course.PageMeta.Description ? course.PageMeta.Description : course.Description}/>
                <meta property="og:url" content={_url}/>
                <meta property="og:site_name" content="Магистерия"/>
                <meta property="fb:app_id" content={facebookAppID}/>
                {
                    course.PageMeta && course.PageMeta.Images && course.PageMeta.Images.og
                        ?
                        [
                            <meta property="og:image" content={_imagePath + course.PageMeta.Images.og.FileName}/>,
                            <meta property="og:image:secure_url"
                                  content={_imagePath + course.PageMeta.Images.og.FileName}/>,
                            <meta property="og:image:width" content={_getWidth(course.PageMeta.Images.og.MetaData)}/>,
                            <meta property="og:image:height" content={_getHeight(course.PageMeta.Images.og.MetaData)}/>
                        ]
                        :
                        null
                }
                <meta name="twitter:card" content="summary_large_image"/>
                <meta name="twitter:title" content={course.PageMeta.Name ? course.PageMeta.Name : course.Name}/>
                <meta name="twitter:description" content={course.PageMeta.Description ? course.PageMeta.Description : course.Description}/>
                <meta name="twitter:site" content="@MagisteriaRu"/>
                {
                    course.PageMeta && course.PageMeta.Images && course.PageMeta.Images.twitter
                        ?
                        <meta name="twitter:image" content={_imagePath + course.PageMeta.Images.twitter.FileName}/>
                        :
                        null
                }
                <meta name="twitter:creator" content="@MagisteriaRu"/>
                <meta name="apple-mobile-web-app-title" content="Magisteria"/>
                <meta name="application-name" content="Magisteria"/>

            </MetaTags>
            :
            null
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

    _removeRobotsMetaTags() {
        $('meta[name="robots"]').remove();
        $('meta[name="prerender-status-code"]').remove();
    }

    render() {
        let { course, fetching, notFound, enabledPaidCourse } = this.props;

        const _needHide = course && course.IsPaid && !enabledPaidCourse

        return fetching ?
            <LoadingFrame/>
            :
            notFound || _needHide ?
                <NotFoundPage/>
                :
                course ?
                    <React.Fragment>
                        {this._getMetaTags()}
                        {
                            course.IsLandingPage ?
                                <WrapperVer2 course={course}
                                             isFavorite={this._isCourseInBookmarks()}
                                             onFavoritesClick={::this._favoritesClick}/>
                                :
                                <WrapperVer1 course={course}
                                             isFavorite={this._isCourseInBookmarks()}
                                             onFavoritesClick={::this._favoritesClick}
                                             shareUrl={window.location.href}/>
                        }
                    </React.Fragment>
                    : null
    }
}

function mapStateToProps(state, ownProps) {
    return {
        courseUrl: ownProps.match.params.url,
        fetching: state.singleCourse.fetching || state.user.loading,
        notFound: state.singleCourse.notFound,
        course: state.singleCourse.object,
        bookmarks: userBookmarksSelector(state),
        authorized: !!state.user.user,
        facebookAppID: facebookAppIdSelector(state),
        enabledPaidCourse: enabledPaidCoursesSelector(state)
    }
}

function mapDispatchToProps(dispatch) {
    return {
        coursesActions: bindActionCreators(coursesActions, dispatch),
        pageHeaderActions: bindActionCreators(pageHeaderActions, dispatch),
        storageActions: bindActionCreators(storageActions, dispatch),
        userActions: bindActionCreators(userActions, dispatch),
        addCourseToBookmarks: bindActionCreators(addCourseToBookmarks, dispatch),
        removeCourseFromBookmarks: bindActionCreators(removeCourseFromBookmarks, dispatch),
        setCurrentPage: bindActionCreators(setCurrentPage, dispatch),
        clearCurrentPage: bindActionCreators(clearCurrentPage, dispatch),
        notifyConcreteCourseShowed: bindActionCreators(notifyConcreteCourseShowed, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Main);