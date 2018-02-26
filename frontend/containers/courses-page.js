import React  from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import CourseModule from '../components/course/course-module'

import * as coursesActions from '../actions/courses-page-actions';
import * as pageHeaderActions from '../actions/page-header-actions';

import * as tools from '../tools/page-tools';

class CoursesPage extends React.Component {
    constructor(props) {
        super(props);
        this._isMobile = tools.isMobile.bind(this);
    }

    componentWillMount() {
        if (!this.props.courses.loaded) {
            this.props.coursesActions.getCourses();
        }

        this.props.pageHeaderActions.setCurrentPage(tools.pages.courses);
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

            return (_inFilter ? <CourseModule course={course} key={index} isMobile={this._isMobile()}/> : null)
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
        ownProps,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        coursesActions: bindActionCreators(coursesActions, dispatch),
        pageHeaderActions: bindActionCreators(pageHeaderActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CoursesPage);
