import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import MetaTags from 'react-meta-tags';

import NotFoundPage from '../components/not-found';
import LoadingFrame from '../components/loading-frame';

import * as coursesActions from '../actions/courses-page-actions';
import * as pageHeaderActions from '../actions/page-header-actions';
import * as storageActions from '../actions/lesson-info-storage-actions';
import * as userActions from "../actions/user-actions";

import $ from 'jquery'

import {pages, getDomain, getPageUrl,} from '../tools/page-tools';
import { addCourseToBookmarks, userBookmarksSelector, removeCourseFromBookmarks, } from "ducks/profile";
import {
    enabledPaidCoursesSelector,
    facebookAppIdSelector,
    setCurrentPage,
    clearCurrentPage,
    notifyAnalyticsChangePage
} from "ducks/app";
import {notifyConcreteCourseShowed} from "ducks/google-analytics";

import ScrollMemoryStorage from "../tools/scroll-memory-storage"

import WrapperVer1 from '../components/course-page-ver1/index'
import WrapperVer2 from '../components/course-page-ver2/index'
import {setVisibleCourse} from "ducks/course";

class Main extends React.Component {
    constructor(props) {
        super(props);
    }

    UNSAFE_componentWillMount() {
        window.scrollTo(0, 0)
        this.props.userActions.whoAmI()
        this.props.storageActions.refreshState();
        this.props.coursesActions.getCourses();
        this.props.coursesActions.getCourse(this.props.courseUrl);
        this.props.pageHeaderActions.setCurrentPage(pages.singleCourse);
    }

    UNSAFE_componentWillUpdate(nextProps) {
        if (this.props.courseUrl && nextProps.courseUrl && (this.props.courseUrl !== nextProps.courseUrl)) {
            this.props.storageActions.refreshState();
            this.props.coursesActions.getCourses();
            this.props.coursesActions.getCourse(nextProps.courseUrl);
            window.scrollTo(0, 0)
        }
    }

    componentDidUpdate(prevProps) {
        let {course} = this.props

        if (course) {
            let _authors = course.Authors
                    .map(item => item.FirstName + " " + item.LastName)
                    .join(", "),
                _categories = course.Categories
                    .map(item => item.Name)
                    .join(", ")

            document.title = `${this.props.course.Name}. ${_authors}. ${_categories} - Магистерия`
        }

        if (prevProps.fetching && !this.props.fetching) {
            const _key = this.props.location.key;
            ScrollMemoryStorage.scrollPage(_key)
            this.props.notifyConcreteCourseShowed(this.props.course)

            this.props.notifyAnalyticsChangePage(this.props.ownProps.location.pathname)
        }

        if (prevProps.course !== course) {
            this.props.setVisibleCourse(course ? course.Id : null)
        }
    }

    componentDidMount() {
        this.props.setCurrentPage(this);
    }

    reload() {
        this.props.userActions.whoAmI()
        this.props.storageActions.refreshState();
        this.props.coursesActions.getCourses();
        this.props.coursesActions.getCourse(this.props.courseUrl);
    }

    componentWillUnmount() {
        this._removeMetaTags();
        this.props.clearCurrentPage();
        this.props.setVisibleCourse(null)
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
                                             onFavoritesClick={::this._favoritesClick}
                                             shareUrl={window.location.href}
                                             moreCourses={this._getMoreCourses()}/>
                                :
                                <WrapperVer1 course={course}
                                             isFavorite={this._isCourseInBookmarks()}
                                             onFavoritesClick={::this._favoritesClick}
                                             shareUrl={window.location.href}/>
                        }
                    </React.Fragment>
                    : null
    }

    _getMoreCourses() {
        let {course, courses} = this.props

        let _courses = courses.reduce((acc, value) => {
            let _hasAuthor = course.Authors.some(item => value.Authors.find(authorId => authorId === item.Id)),
                _hasCategory = course.Categories.some(item => value.Categories.find(categoryId => categoryId === item.Id))

            if ((_hasAuthor || _hasCategory) && (value.Id !== course.Id) && !value.OneLesson) {
                acc.push(value)
            }

            return acc
        }, [])

        _courses.sort((item1, item2) => {
            // сортируем по признаку платности
            let _result = item2.IsPaid - item1.IsPaid

            // далее по признаку купленности
            if (!_result) {
                const _bought1 = item1.IsBought || item1.IsGift,
                    _bought2 = item2.IsBought || item2.IsGift

                _result = _bought1 - _bought2
            }


            // далее вверх поднимаем курсы автора
            if (!_result) {
                const _hasAuthor1 = course.Authors.some(item => item1.Authors.find(authorId => authorId === item.Id)),
                    _hasAuthor2 = course.Authors.some(item => item2.Authors.find(authorId => authorId === item.Id))

                _result = _hasAuthor2 - _hasAuthor1
            }

            // Среди бесплатных приоритезируем те, которые еще не слушались данным пользователем
            if (!_result && !item2.IsPaid && !item1.IsPaid) {
                const _hasListened1 = item1.statistics && item1.statistics.lessons.hasListened,
                    _hasListened2 = item2.statistics && item2.statistics.lessons.hasListened

                _result = _hasListened1 - _hasListened2
            }


            return _result
        })

        return _courses.slice(0, 6)
    }

}

function mapStateToProps(state, ownProps) {
    return {
        courseUrl: ownProps.match.params.url,
        fetching: state.singleCourse.fetching || state.user.loading || state.courses.fetching,
        notFound: state.singleCourse.notFound,
        course: state.singleCourse.object,
        courses: state.courses.items,
        bookmarks: userBookmarksSelector(state),
        authorized: !!state.user.user,
        facebookAppID: facebookAppIdSelector(state),
        enabledPaidCourse: enabledPaidCoursesSelector(state),
        ownProps
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
        notifyAnalyticsChangePage: bindActionCreators(notifyAnalyticsChangePage, dispatch),
        setVisibleCourse: bindActionCreators(setVisibleCourse, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Main);
