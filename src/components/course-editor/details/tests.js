import React from 'react'
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import PropTypes from 'prop-types'
import {enableButtonsSelector} from "adm-ducks/app";
import {testsSelector, createNewTest, editTest, deleteTest} from "adm-ducks/test-list";
import GridControl from "../../gridControl";

class CourseTestsWrapper extends React.Component {

    static propTypes = {
        editMode: PropTypes.bool,
        courseId: PropTypes.number,
    }

    render() {
        let {tests, selectedLesson, editMode, enableButtons} = this.props;

        return <CourseTests selected={selectedLesson}
                              editMode={editMode}
                              data={tests}
                              createAction={::this._createTest}
                              editAction={::this._editTest}
                              removeAction={::this.props.deleteTest}
                              disabled={!enableButtons}/>
    }

    _createTest() {
        this.props.createNewTest(this.props.courseId)
    }

    _editTest(id) {
        this.props.editTest(this.props.courseId, id)
    }

}

class CourseTests extends GridControl{

    _getId() {
        return 'course-tests';
    }

    _getColumns() {
        let _columns = [
            {id: 'Number', header: '#', width: 30},
            {id: 'Name', header: ['Название', {content:"textFilter"}], fillspace: true},
            {id: 'Method', header: ['Вид теста', {content:"selectFilter"}] , width: 150},
        ];

        _columns.push(...super._getColumns());

        return _columns;
    }
}

function mapStateToProps(state) {
    return {
        tests: testsSelector(state),

        // courseLessons: state.courseLessons.current,
        // selectedLesson: state.courseLessons.selected,

        // courseCategories: state.courseCategories.current,
        // selectedCategory: state.courseCategories.selected,

        enableButtons: enableButtonsSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({createNewTest, editTest, deleteTest}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(CourseTestsWrapper);