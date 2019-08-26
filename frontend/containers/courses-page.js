import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Redirect} from 'react-router';
import {Link,} from 'react-router-dom'

import * as coursesActions from '../actions/courses-page-actions';
import * as pageHeaderActions from '../actions/page-header-actions';
import * as storageActions from '../actions/lesson-info-storage-actions';
import {whoAmI} from "../actions/user-actions";
import {notifyCoursesShowed} from "ducks/google-analytics";

import * as tools from '../tools/page-tools';
import CourseWrapper from '../components/course/item-wrapper';
import FixCourseWrapper from '../components/fixed/course/wrapper';
import FixLessonWrapper from '../components/fixed/lesson/wrapper';
import {
    filtersSelector,
    isEmptyFilterSelector,
    loadingSelector,
    selectedFilterSelector,
    applyExternalFilter, clear
} from "ducks/filters";
import {fixedCourseIdSelector, fixedLessonIdSelector} from "ducks/params";
import {userPaidCoursesSelector} from "ducks/profile";
import {setCurrentPage, clearCurrentPage,} from "ducks/app";
import ScrollMemoryStorage from "../tools/scroll-memory-storage";
import MetaTags from 'react-meta-tags';
import $ from "jquery";

class CoursesPage extends React.Component {
    constructor(props) {
        super(props);
        this._needRedirectToCourses = false;
    }

    componentWillMount() {
        window.scrollTo(0, 0)
        this.props.coursesActions.getCourses();
        this.props.whoAmI()
        this.props.storageActions.refreshState();
        this.props.pageHeaderActions.setCurrentPage(tools.pages.courses);
    }

    componentDidMount() {
        document.title = 'Магистерия'
        this.props.setCurrentPage(this);
    }

    reload() {
        this.props.whoAmI()
        this.props.coursesActions.getCourses();
        this.props.storageActions.refreshState();
    }

    componentDidUpdate(prevProps) {
        let {hasExternalFilter, externalFilter, loadingFilters, isEmptyFilter, selectedFilter} = this.props;

        if (prevProps.loadingFilters && !loadingFilters) {
            if (hasExternalFilter) {
                this.props.applyExternalFilter(externalFilter)
            }
        }

        if (!hasExternalFilter && (prevProps.selectedFilter.size > 0)) {
            this.props.clearFilter()
        }

        if (!prevProps.isEmptyFilter && isEmptyFilter) {
            this._needRedirectToCourses = true
        }

        if (!prevProps.selectedFilter.equals(selectedFilter) && !isEmptyFilter) {
            let _filter = [];
            selectedFilter.forEach(item => _filter.push(item.get('URL')));
            this.props.history.replace('/razdel/' + _filter.join('+'))
        }

        if (!prevProps.selectedFilter.equals(selectedFilter)) {
            this.props.notifyCoursesShowed(this._getVisibleCourses())
        }

        if (prevProps.fetching && !this.props.fetching) {
            const _key = this.props.location.key;
            ScrollMemoryStorage.scrollPage(_key)
            if (!hasExternalFilter) {
                this.props.notifyCoursesShowed(this._getVisibleCourses())
            }
        }
    }

    componentWillUnmount() {
        this._removeMetaTags();
        this.props.clearCurrentPage();
        ScrollMemoryStorage.saveCourseBundlesHeight($('.courses'))
    }

    _getCoursesBundles() {
        let {isEmptyFilter, selectedFilter, fixedCourseId, fixedLessonId, userPaidCourses} = this.props,
            _courses = this.props.courses.items,
            _result = [];

        _courses.forEach((course, index) => {
            let _inFilter = false;

            if (isEmptyFilter) {
                _inFilter = true
            } else {
                _inFilter = course.Categories.some((categoryId) => {
                    return selectedFilter.find((item) => {
                        return item.get('id') === categoryId
                    });
                });
            }

            if (_inFilter) {
                if (course.Id === fixedCourseId) {
                    _result.unshift(<FixCourseWrapper course={course}/>)
                } else {
                    if (fixedLessonId) {
                        let _lesson = course.Lessons.find((lesson) => {
                            return lesson.Id === fixedLessonId
                        })

                        if (_lesson) {
                            let _isPaidCourse = (course && course.IsPaid && !userPaidCourses.includes(course.Id))

                            _lesson.author = course.AuthorsObj.find(author => author.Id === _lesson.AuthorId)
                            _lesson.category = course.CategoriesObj
                            _result.unshift(<FixLessonWrapper lesson={_lesson} course={course} isPaidCourse={_isPaidCourse} />)
                        }
                    }

                    _result.push(<CourseWrapper course={course} lazyload={isEmptyFilter} key={index} index={index}/>)
                }

            }
        })

        return _result
    }

    render() {
        if (this._needRedirectToCourses) {
            this._needRedirectToCourses = false;
            return <Redirect push to={'/'}/>;
        }

        const { fetching,} = this.props

        return (
            fetching ?
                <p>Загрузка...</p>
                :
                <React.Fragment>
                    {this._getMetaTags()}
                    <div className={"courses courses-page" + (this.props.showFiltersForm ? ' courses_opened_filter_row' : '')}
                         key={"courses-page"} id={"courses-page"}>
                        {this._getCoursesBundles()}
                    </div>
                </React.Fragment>
        )
    }

    _getMetaTags() {
        this._removeRobotsMetaTags()

        return <MetaTags>
            <meta name="description" content="Образовательный сайт с лекциями о живописи, музыке, философии, литературе, истории и многом другом."/>
        </MetaTags>
    }

    _removeMetaTags() {
        $('meta[name="description"]').remove();
        $('meta[name="robots"]').remove();
        $('meta[name="prerender-status-code"]').remove();
    }

    _removeRobotsMetaTags() {
        $('meta[name="robots"]').remove();
        $('meta[name="prerender-status-code"]').remove();
    }

    _getVisibleCourses() {
        let {isEmptyFilter, selectedFilter} = this.props,
            _courses = this.props.courses.items,
            _result = [];

        _courses.forEach((course) => {
            let _inFilter = false;

            if (isEmptyFilter) {
                _inFilter = true
            } else {
                _inFilter = course.Categories.some((categoryId) => {
                    return selectedFilter.find((item) => {
                        return item.get('id') === categoryId
                    });
                });
            }

            if (_inFilter) {
                _result.push(course)
            }
        })

        return _result
    }
}


function mapStateToProps(state, ownProps) {
    return {
        courses: state.courses,
        filters: filtersSelector(state),
        isEmptyFilter: isEmptyFilterSelector(state),
        loadingFilters: loadingSelector(state),
        fetching: state.user.loading || state.courses.fetching,
        selectedFilter: selectedFilterSelector(state),
        size: state.app.size,
        showFiltersForm: state.pageHeader.showFiltersForm,
        externalFilter: ownProps.match.params.filter,
        fixedCourseId: fixedCourseIdSelector(state),
        fixedLessonId: fixedLessonIdSelector(state),
        userPaidCourses: userPaidCoursesSelector(state),
        ownProps,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        coursesActions: bindActionCreators(coursesActions, dispatch),
        pageHeaderActions: bindActionCreators(pageHeaderActions, dispatch),
        storageActions: bindActionCreators(storageActions, dispatch),
        applyExternalFilter: bindActionCreators(applyExternalFilter, dispatch),
        clearFilter: bindActionCreators(clear, dispatch),
        setCurrentPage: bindActionCreators(setCurrentPage, dispatch),
        clearCurrentPage: bindActionCreators(clearCurrentPage, dispatch),
        whoAmI: bindActionCreators(whoAmI, dispatch),
        notifyCoursesShowed: bindActionCreators(notifyCoursesShowed, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps, null, { withRef: true })(CoursesPage);
