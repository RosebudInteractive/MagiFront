import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import MetaTags from 'react-meta-tags';

import InfoBlock from '../components/course-extended/info-block/'
import Content from '../components/course-extended/content-extended';
import CourseLessons from '../components/course-extended/course-lessons';
import CourseBooks from '../components/course-extended/course-books';
import NotFoundPage from '../components/not-found';
import LoadingFrame from '../components/loading-frame';

import * as coursesActions from '../actions/courses-page-actions';
import * as pageHeaderActions from '../actions/page-header-actions';
import * as storageActions from '../actions/lesson-info-storage-actions';
import * as userActions from "../actions/user-actions";
import PropTypes from 'prop-types';

import $ from 'jquery'

import {pages, getDomain, getPageUrl, getCoverPath, ImageSize,} from '../tools/page-tools';
import { addCourseToBookmarks, userBookmarksSelector, removeCourseFromBookmarks, } from "ducks/profile";
import {enabledPaidCoursesSelector, facebookAppIdSelector} from "ducks/app";

class Main extends React.Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.props.userActions.whoAmI()
        this.props.storageActions.refreshState();
        this.props.coursesActions.getCourse(this.props.courseUrl);
        this.props.pageHeaderActions.setCurrentPage(pages.singleCourse);
    }

    componentDidUpdate() {
        if (this.props.course) {
            document.title = 'Курс: ' + this.props.course.Name + ' - Магистерия'
        }
    }

    componentWillUnmount() {
        this._removeMetaTags();
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
            _title = course ? (course.Name + ' - Магистерия') : '',
            _coverPath = getCoverPath(course, ImageSize.small),
            _cover = _coverPath ? '/data/' + _coverPath : null;

        return course
            ?
            <MetaTags>
                <meta name="description" content={course.Description}/>
                <link rel="canonical" href={_url}/>
                <link rel="publisher" href="https://plus.google.com/111286891054263651937"/>
                <meta property="og:locale" content="ru_RU"/>
                <meta property="og:type" content="object"/>
                <meta property="og:title" content={_title}/>
                <meta property="og:description" content={course.Description}/>
                <meta property="og:url" content={_url}/>
                <meta property="og:site_name" content="Магистерия"/>
                <meta property="fb:app_id" content={facebookAppID}/>
                <meta property="og:image" content={_domain + _cover}/>
                <meta property="og:image:secure_url" content={_domain + _cover}/>
                <meta name="twitter:card" content="summary_large_image"/>
                <meta name="twitter:description" content={course.Description}/>
                <meta name="twitter:title" content={_title}/>
                <meta name="twitter:site" content="@MagisteriaRu"/>
                <meta name="twitter:image" content={_domain + _cover}/>
                <meta name="apple-mobile-web-app-title" content="Magisteria"/>
                <meta name="application-name" content="Magisteria"/>
            </MetaTags>
            :
            null
    }

    _removeMetaTags() {
        $('meta[name="description"]').remove();
        $('link[rel="canonical"]').remove();
        $('link[rel="publisher"]').remove();
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
    }

    render() {
        let {
            course,
            fetching,
            courseUrl,
            notFound, enabledPaidCourse
        } = this.props;

        const _needHide = course && course.IsPaid && !enabledPaidCourse

        return fetching ?
            <LoadingFrame/>
            :
            notFound || _needHide ?
                <NotFoundPage/>
                :
                course ?
                    [
                        this._getMetaTags(),
                        <div className="courses">
                            <CourseModuleExt
                                isFavorite={this._isCourseInBookmarks()}
                                onFavoritesClick={::this._favoritesClick}
                                shareUrl={window.location.href}
                                course={course}
                            />
                            <CourseTabs
                                lessons={{total: course.lessonCount, ready: course.readyLessonCount}}
                                books={{total: course.RefBooks.length}}
                                courseUrl={courseUrl}
                            />
                        </div>
                    ]
                    : null
    }
}

class CourseModuleExt extends React.Component {

    static propTypes = {
        isFavorite: PropTypes.func,
        onFavoritesClick: PropTypes.func,
        shareUrl: PropTypes.string,
        course: PropTypes.object,
    }

    render() {
        const {course, shareUrl} = this.props

        return (
            <div className="course-module course-module--extended">
                <TitleWrapper {...this.props}/>
                <Inner shareUrl={shareUrl} counter={course.ShareCounters}/>
            </div>
        )
    }
}

class TitleWrapper extends React.Component {
    static propTypes = {
        isFavorite: PropTypes.func,
        onFavoritesClick: PropTypes.func,
        course: PropTypes.object,
    }

    render() {
        let {isFavorite, onFavoritesClick, course} = this.props;

        const _crown = '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#crown"/>'

        return (
            <div className="course-module__title-wrapper">
                <h1 className="course-module__title no_underline">
                    <span className={"favourites" + (isFavorite ? ' active' : '')}
                          onClick={onFavoritesClick}>В закладки</span>
                    <p className="course-module__label">
                        {
                            course.IsPaid ?
                                <svg className="course-module__label-icon" width="18" height="18"
                                     dangerouslySetInnerHTML={{__html: _crown}}/>
                                :
                                null
                        }
                        Курс:
                    </p>
                    <span>{course.Name}</span>
                </h1>
            </div>
        )
    }
}

class Inner extends React.Component {
    render() {
        return (
            <div className="course-module__inner">
                <InfoBlock/>
                <Content shareUrl={this.props.shareUrl} counter={this.props.counter}/>
            </div>
        )
    }
}

const CourseTabsName = {
    lessons: 'lesson',
    books: 'books'
};

class CourseTabs extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            activeTab: CourseTabsName.lessons
        }
    }

    _onSetActiveTab(tabName) {
        if (tabName !== this.state.activeTab) {
            this.setState({activeTab: tabName})
        }
    }

    _getList() {
        return (
            this.state.activeTab === CourseTabsName.lessons ? <CourseLessons courseUrl={this.props.courseUrl}/> :
                <CourseBooks/>
        )
    }

    render() {
        return (
            <div className="course-tabs">
                <ul className="course-tab-controls">
                    <LessonsTab
                        total={this.props.lessons.total}
                        ready={this.props.lessons.ready}
                        onClick={::this._onSetActiveTab}
                        active={this.state.activeTab === CourseTabsName.lessons}/>
                    <BooksTab
                        total={this.props.books.total}
                        onClick={::this._onSetActiveTab}
                        active={this.state.activeTab === CourseTabsName.books}/>
                </ul>
                <ul className="course-tabs-list">
                    {this._getList()}
                </ul>
            </div>
        )
    }
}

class LessonsTab extends React.Component {
    _onClick() {
        this.props.onClick(CourseTabsName.lessons)
    }

    render() {
        return (
            <li className={'course-tab-control' + (this.props.active ? ' active' : '')} onClick={::this._onClick}>
                <span className="course-tab-control__title">Лекции</span>
                <span className="course-tab-control__label">Вышло</span>
                <span className="course-tab-control__actual">{this.props.ready}</span>
                <span className="course-tab-control__total">/{this.props.total}</span>
            </li>
        )
    }
}

class BooksTab extends React.Component {
    _onClick() {
        if ((this.props) && (this.props.total)) {
            this.props.onClick(CourseTabsName.books)
        }
    }

    render() {
        return (
            <li className={'course-tab-control' + (this.props.active ? ' active' : '')} onClick={::this._onClick}>
                <span className="course-tab-control__title _desktop">Список для чтения:</span>
                <span className="course-tab-control__title _mobile">Книги</span>
                {
                    this.props.total ?
                        <div>
                            <span className="course-tab-control__actual">{this.props.total + ' '}</span>
                            <span className="course-tab-control__label">книги</span>
                        </div>
                        :
                        <div className='course-tab-control__empty-container'>
                            <span className="course-tab-control__empty _desktop">пока пуст</span>
                            <span className="course-tab-control__empty _mobile">0</span>
                        </div>
                }
            </li>
        )
    }
}

function mapStateToProps(state, ownProps) {
    return {
        courseUrl: ownProps.match.params.url,
        fetching: state.singleCourse.fetching,
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
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Main);