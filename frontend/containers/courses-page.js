import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import CourseModuleLazyload from '../components/course/course-module-lazyload'

import * as coursesActions from '../actions/courses-page-actions';
import * as pageHeaderActions from '../actions/page-header-actions';
import * as storageActions from '../actions/lesson-info-storage-actions';

import * as tools from '../tools/page-tools';
// import {forceCheck} from 'react-lazyload';
import CourseModule from "../components/course/course-module";
import {filtersSelector, isEmptyFilterSelector, loadingSelector, selectedFilterSelector, applyExternalFilter} from "../ducks/filters";

class CoursesPage extends React.Component {
    constructor(props) {
        super(props);
        this._isMobile = tools.isMobile.bind(this);
    }

    componentWillMount() {
        if (!this.props.courses.loaded) {
            this.props.coursesActions.getCourses();
        }
        this.props.storageActions.refreshState();
        this.props.pageHeaderActions.setCurrentPage(tools.pages.courses);
    }

    componentDidMount() {
        document.title = 'Магистерия'
    }

    componentWillReceiveProps(newProps) {
        // if (!this.props.pageHeaderState.showFiltersForm && newProps.pageHeaderState.showFiltersForm) {
        //     forceCheck();
        // }
    }

    componentDidUpdate(prevProps) {
        let {hasExternalFilter, externalFilter, loadingFilters, isEmptyFilter, selectedFilter} = this.props;

        if (prevProps.loadingFilters && !loadingFilters) {
            if (hasExternalFilter) {
                this.props.applyExternalFilter(externalFilter)
            }
        }

        if (!prevProps.isEmptyFilter && isEmptyFilter) {
            this.props.history.go('/')
        }

        if (!prevProps.selectedFilter.equals(selectedFilter)) {
            let _filter = [];
            selectedFilter.forEach(item => _filter.push(item.get('URL')));
            this.props.history.replace('/razdel/' + _filter.join('+'))
        }
    }

    _getCoursesBundles() {

        let {isEmptyFilter, selectedFilter} = this.props;
        let _courses = this.props.courses.items;

        return _courses.map((course, index) => {
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

            return (
                _inFilter
                    ?
                    isEmptyFilter
                        ?
                        <CourseModuleLazyload course={course} key={index} isMobile={this._isMobile()}/>
                        :
                        <CourseModule course={course} key={index} isMobile={this._isMobile()}/>
                    :
                    null
            )
        })
    }

    render() {
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
        ownProps,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        coursesActions: bindActionCreators(coursesActions, dispatch),
        pageHeaderActions: bindActionCreators(pageHeaderActions, dispatch),
        storageActions: bindActionCreators(storageActions, dispatch),
        applyExternalFilter: bindActionCreators(applyExternalFilter, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CoursesPage);
