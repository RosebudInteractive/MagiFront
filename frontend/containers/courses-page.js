import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {Redirect} from 'react-router';

import * as coursesActions from '../actions/courses-page-actions';
import * as pageHeaderActions from '../actions/page-header-actions';
import * as storageActions from '../actions/lesson-info-storage-actions';
import {whoAmI} from "../actions/user-actions";

import * as tools from '../tools/page-tools';
import CourseWrapper from '../components/course/item-wrapper';
import FixCourseWrapper from '../components/fixed/course/wrapper';
import FixLessonWrapper from '../components/fixed/lesson/wrapper';
import {
    filtersSelector,
    isEmptyFilterSelector,
    loadingSelector,
    selectedFilterSelector,
    applyExternalFilter
} from "ducks/filters";
import {fixedCourseIdSelector, fixedLessonIdSelector} from "ducks/params";
import {userPaidCoursesSelector} from "ducks/profile";
import {setCurrentPage, clearCurrentPage,} from "ducks/app";

class CoursesPage extends React.Component {
    constructor(props) {
        super(props);
        this._needRedirectToCourses = false;
    }

    componentWillMount() {
        if (!this.props.courses.loaded) {
            this.props.coursesActions.getCourses();
        }
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

        if (!prevProps.isEmptyFilter && isEmptyFilter) {
            this._needRedirectToCourses = true
        }

        if (!prevProps.selectedFilter.equals(selectedFilter) && !isEmptyFilter) {
            let _filter = [];
            selectedFilter.forEach(item => _filter.push(item.get('URL')));
            this.props.history.replace('/razdel/' + _filter.join('+'))
        }
    }

    componentWillUnmount() {
        this.props.clearCurrentPage();
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
                            _result.unshift(<FixLessonWrapper lesson={_lesson} courseUrl={course.URL} isPaidCourse={_isPaidCourse} />)
                        }
                    }

                    _result.push(<CourseWrapper course={course} lazyload={isEmptyFilter} key={index}/>)
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

        const {
            fetching,
        } = this.props.courses;
        return (
            fetching ?
                <p>Загрузка...</p>
                :
                <div className={"courses" + (this.props.showFiltersForm ? ' courses_opened_filter_row' : '')}>
                    {this._getCoursesBundles()}
                </div>
        )
    }
}


function mapStateToProps(state, ownProps) {
    return {
        courses: state.courses,
        filters: filtersSelector(state),
        isEmptyFilter: isEmptyFilterSelector(state),
        loadingFilters: loadingSelector(state),
        selectedFilter: selectedFilterSelector(state),
        size: state.app.size,
        // pageHeaderState: state.pageHeader,
        showFiltersForm: state.pageHeader.showFiltersForm,
        externalFilter: ownProps.match.params.filter,
        fixedCourseId: fixedCourseIdSelector(state),
        fixedLessonId: fixedLessonIdSelector(state),
        userPaidCourses : userPaidCoursesSelector(state),
        ownProps,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        coursesActions: bindActionCreators(coursesActions, dispatch),
        pageHeaderActions: bindActionCreators(pageHeaderActions, dispatch),
        storageActions: bindActionCreators(storageActions, dispatch),
        applyExternalFilter: bindActionCreators(applyExternalFilter, dispatch),
        setCurrentPage: bindActionCreators(setCurrentPage, dispatch),
        clearCurrentPage: bindActionCreators(clearCurrentPage, dispatch),
        whoAmI: bindActionCreators(whoAmI, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps, null, { withRef: true })(CoursesPage);
