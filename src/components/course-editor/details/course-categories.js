import React from 'react'
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {CourseCategories,} from './course-grids'
import PropTypes from 'prop-types'
import * as courseCategoriesActions from "../../../actions/course/courseCategoriesActions";

class CourseCategoriesWrapper extends React.Component {

    static propTypes = {
        editMode : PropTypes.bool,
    }

    render() {
        return <CourseCategories addAction={::this.props.courseCategoriesActions.showAddDialog}
                                 removeAction={::this.props.courseCategoriesActions.remove}
                                 selectAction={::this.props.courseCategoriesActions.select}
                                 selected={this.props.selectedCategory}
                                 editMode={this.editMode}
                                 data={::this._getCourseCategories()}/>
    }

    _getCourseCategories() {
        const {
            categories,
            courseCategories
        } = this.props;

        let _courseCategories = [];

        courseCategories.map((item) => {
            let _category = categories.find((category) => {
                return category.id === item
            });

            if (_category) {
                _courseCategories.push(_category);
            }
        });

        return _courseCategories;
    }

}

function mapStateToProps(state) {
    return {
        categories: state.categoriesList.categories,
        courseCategories: state.courseCategories.current,
        selectedCategory: state.courseCategories.selected,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        courseCategoriesActions: bindActionCreators(courseCategoriesActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CourseCategoriesWrapper);