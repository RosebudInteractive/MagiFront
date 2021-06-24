import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Redirect} from 'react-router';

import * as coursesActions from '../actions/courses-page-actions';
import * as pageHeaderActions from '../actions/page-header-actions';
import * as storageActions from '../actions/lesson-info-storage-actions';
import {whoAmI} from "actions/user-actions";
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
    filterCourseTypeSelector,
    filterMainTypeSelector,
    applyExternalFilter, clear,
    setInitialState,
    enableScrollGuard,
    disableScrollGuard,
} from "ducks/filters";
import {fixedCourseIdSelector, fixedLessonIdSelector} from "ducks/params";
import {userPaidCoursesSelector} from "ducks/profile";
import {setCurrentPage, clearCurrentPage,} from "ducks/app";
import ScrollMemoryStorage from "../tools/scroll-memory-storage";
import MetaTags from 'react-meta-tags';
import $ from "jquery";
import {FILTER_COURSE_TYPE,} from "../constants/filters";
import {FILTER_TYPE} from "../constants/common-consts";
import {OverflowHandler} from "tools/page-tools";
import {notifyAnalyticsChangePage} from 'ducks/app';
import browserHistory from "../history";

class CoursesPage extends React.Component {
    constructor(props) {
        super(props);
        this._needRedirectToCourses = false;
        this._historyGuard = false
        this._externalFilterGuard = false
    }

    UNSAFE_componentWillMount() {
        window.scrollTo(0, 0)
        this.props.coursesActions.getCourses();
        this.props.whoAmI()
        this.props.storageActions.refreshState();
        this.props.pageHeaderActions.setCurrentPage(tools.pages.courses);
    }

    componentDidMount() {
        document.title = this._getTitle()
        this.props.setCurrentPage(this);
    }

    reload() {
        this.props.whoAmI()
        this.props.coursesActions.getCourses();
        this.props.storageActions.refreshState();
    }

    componentDidUpdate(prevProps) {
        let {hasExternalFilter, externalFilter, filterType, loadingFilters, selectedFilter, filterMainType, filterCourseType,} = this.props;

        const _filterType = this._getFilterType()

        if ((prevProps.filterType !== filterType) && (filterType === FILTER_TYPE.EMPTY)) {
            this.props.setInitialState()
        }

        if (prevProps.loadingFilters && !loadingFilters) {
            if (hasExternalFilter) {
                this._historyGuard = true
                this._externalFilterGuard = false
                this.props.applyExternalFilter(filterType, externalFilter)
                return
            }
        } else {
            if (hasExternalFilter && ((prevProps.externalFilter !== externalFilter) || (prevProps.filterType !== filterType))) {
                if (this._externalFilterGuard) {
                    this._externalFilterGuard = false
                } else {
                    this._historyGuard = true
                    this.props.applyExternalFilter(filterType, externalFilter)
                    return
                }
            }
        }

        const _filterChanged = !prevProps.selectedFilter.equals(selectedFilter) ||
            (prevProps.filterMainType !== filterMainType) ||
            (!prevProps.filterCourseType.equals(filterCourseType))

        if (_filterChanged && !loadingFilters) {
            document.title = this._getTitle()

            this.props.enableScrollGuard()

            const _top = this._getTop()
            if (!this.props.isMenuVisible) {
                window.scrollTo(0, _top)
            } else {
                OverflowHandler.setPositionAfterTurnOff(_top)
            }

            let _filter = []

            selectedFilter.forEach((item) => {
                _filter.push(item.get('URL'))
            })

            if ((_filter.length === 0) && (_filterType === FILTER_TYPE.EMPTY)) {
                this.props.setInitialState()
                this.props.notifyAnalyticsChangePage(this.props.ownProps.location.pathname)
            } else {
                let _filters = (_filter.length > 0) ? _filter.join('+') : 'all',
                    _url = `/${_filterType.toLocaleLowerCase()}/${_filters}` + this.props.ownProps.location.search


                console.log("ACTION :: ", this.props.history.action, "length : ", this.props.history.length)
                if (!this._historyGuard) {
                    this.props.history.push(_url)
                    this._externalFilterGuard = true
                } else {
                    this._historyGuard = false
                }

                this.props.notifyAnalyticsChangePage(_url)
            }
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

            this.props.notifyAnalyticsChangePage(this.props.ownProps.location.pathname)
        }
    }

    componentWillUnmount() {
        this._removeMetaTags();
        this.props.clearCurrentPage();
        ScrollMemoryStorage.saveCourseBundlesHeight($('.courses'))
    }

    _getCoursesBundles() {
        let {isEmptyFilter, selectedFilter, fixedCourseId, fixedLessonId, userPaidCourses, filterCourseType} = this.props,
            _courses = this.props.courses.items,
            _result = [];

        _courses
            .filter((course) => {
                if (isEmptyFilter) {
                    return filterCourseType.has(course.CourseType)
                } else {
                    return course.Categories.some((categoryId) => {
                        return selectedFilter.find((item) => {
                            return (item.get('id') === categoryId) && filterCourseType.has(course.CourseType)
                        });
                    });
                }
            })
            .forEach((course, index,) => {
                let _needLazyLoading = isEmptyFilter

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

                    _result.push(<CourseWrapper course={course} lazyload={_needLazyLoading} key={index} index={index}/>)
                }
            })

        return _result
    }

    render() {
        if (this._needRedirectToCourses) {
            this._needRedirectToCourses = false;
            browserHistory.push('/')
            return null
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
            <meta name="description" content="Смотреть и читать онлайн лекции для студентов, старшеклассников и всех людей с культурными запросами. Зачерпни знания у источника!"/>
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

    _getFilterType() {
        const {filterCourseType, filterMainType, isEmptyFilter} = this.props

        if (filterCourseType.has(FILTER_COURSE_TYPE.PRACTICE) && filterCourseType.has(FILTER_COURSE_TYPE.THEORY)) {
            if (!isEmptyFilter) {
                return (filterMainType === FILTER_COURSE_TYPE.THEORY) ? FILTER_TYPE.RAZDEL : FILTER_TYPE.RAZDEL_REVERSE
            } else {
                return (filterMainType === FILTER_COURSE_TYPE.THEORY) ? FILTER_TYPE.EMPTY : FILTER_TYPE.RAZDEL_REVERSE
            }
        } else if (filterMainType === FILTER_COURSE_TYPE.THEORY) {
            return FILTER_TYPE.KNOWLEDGE
        } else if (filterMainType === FILTER_COURSE_TYPE.PRACTICE) {
            return FILTER_TYPE.KNOWHOW
        } else {
            return FILTER_TYPE.EMPTY
        }
    }

    _getTitle() {
        if (this.props.isEmptyFilter) {
            return "Магистерия. Образовательный сайт с лекциями о живописи, музыке, философии, литературе, истории, искусству, религии, психологии."
        } else {
            let _category = this.props.selectedFilter.first().get("name")

            return `${_category}. Лекции смотреть, слушать и читать онлайн - Магистерия`
        }
    }

    _getTop() {
        let _header = $('.page-header'),
            _headerRow = $('.js-page-header-1')

        return (_headerRow && (_headerRow.length > 0) && _header && (_header.length > 0) && _header.hasClass('_animate')) ?
            _headerRow.outerHeight()
            :
            0
    }
}


function mapStateToProps(state, ownProps) {
    return {
        courses: state.courses,
        filters: filtersSelector(state),
        isEmptyFilter: isEmptyFilterSelector(state),
        loadingFilters: loadingSelector(state),
        filterMainType: filterMainTypeSelector(state),
        fetching: state.user.loading || state.courses.fetching,
        selectedFilter: selectedFilterSelector(state),
        size: state.app.size,
        showFiltersForm: state.pageHeader.showFiltersForm,
        externalFilter: ownProps.match.params.filter,
        fixedCourseId: fixedCourseIdSelector(state),
        fixedLessonId: fixedLessonIdSelector(state),
        userPaidCourses: userPaidCoursesSelector(state),
        filterCourseType: filterCourseTypeSelector(state),
        isMenuVisible: state.pageHeader.showMenu,
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
        setInitialState: bindActionCreators(setInitialState, dispatch),
        enableScrollGuard: bindActionCreators(enableScrollGuard, dispatch),
        disableScrollGuard: bindActionCreators(disableScrollGuard, dispatch),
        notifyAnalyticsChangePage: bindActionCreators(notifyAnalyticsChangePage, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps, null, { withRef: true })(CoursesPage);
