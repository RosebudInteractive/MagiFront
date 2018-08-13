import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import CourseModuleLazyload from '../components/course/course-module-lazyload'

import * as coursesActions from '../actions/courses-page-actions';
import * as pageHeaderActions from '../actions/page-header-actions';
import * as storageActions from '../actions/lesson-info-storage-actions';

import * as tools from '../tools/page-tools';
import {forceCheck} from 'react-lazyload';
import CourseModule from "../components/course/course-module";

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
        if (!this.props.pageHeaderState.showFiltersForm && newProps.pageHeaderState.showFiltersForm) {
            forceCheck();
        }
    }

    _getCoursesBundles() {

        let {filters} = this.props;
        let _courses = this.props.courses.items;

        let _cleanFilter = filters.every((filter) => {
            return !filter.selected;
        });

        return _courses.map((course, index) => {
            let _inFilter = false;

            if (_cleanFilter) {
                _inFilter = true
            } else {

                _inFilter = course.Categories.some((categoryId) => {
                    let _filter = filters.find((item) => {
                        return item.id === categoryId
                    });

                    return _filter ? _filter.selected : false;
                });
            }

            return (
                _inFilter
                    ?
                    _cleanFilter
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
                <div className="courses">
                    {this._getCoursesBundles()}
                </div>
        )
    }
}


function mapStateToProps(state, ownProps) {
    return {
        courses: state.courses,
        filters: state.filters.items,
        size: state.app.size,
        pageHeaderState: state.pageHeader,
        ownProps,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        coursesActions: bindActionCreators(coursesActions, dispatch),
        pageHeaderActions: bindActionCreators(pageHeaderActions, dispatch),
        storageActions: bindActionCreators(storageActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CoursesPage);
