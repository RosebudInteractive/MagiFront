import React from 'react'
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {CourseLessons,} from './course-grids'
import PropTypes from 'prop-types'
import * as courseLessonsActions from "../../../actions/course/courseLessonsActions";
import history from '../../../history'

class CourseLessonsWrapper extends React.Component {

    static propTypes = {
        editMode: PropTypes.bool,
        courseId: PropTypes.number,
    }

    render() {
        let {courseLessons, selectedLesson, editMode} = this.props;

        return <CourseLessons selected={selectedLesson}
                              editMode={editMode}
                              data={courseLessons}
                              createAction={this._canCreateLesson() ? ::this._createLesson : null}
                              editAction={::this._editLesson}
                              selectAction={::this.props.courseLessonsActions.select}
                              removeAction={::this.props.courseLessonsActions.remove}
                              moveUpAction={::this.props.courseLessonsActions.moveUp}
                              moveDownAction={::this.props.courseLessonsActions.moveDown}
        />
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

    _canCreateLesson() {
        let {course, courseLessons} = this.props

        return (course && course.OneLesson) ?
            (course.Lessons && courseLessons.length < 1)
            :
            true
    }

    _createLesson() {
        this.props.history.push('/adm/courses/edit/' + this.props.courseId + '/lessons/new/');
    }

    _editLesson(id) {
        history.push('/adm/courses/edit/' + this.props.courseId + '/lessons/edit/' + id);
    }

}

function mapStateToProps(state) {
    return {
        course: state.singleCourse.current,

        courseLessons: state.courseLessons.current,
        selectedLesson: state.courseLessons.selected,

        courseCategories: state.courseCategories.current,
        selectedCategory: state.courseCategories.selected,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        courseLessonsActions: bindActionCreators(courseLessonsActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CourseLessonsWrapper);