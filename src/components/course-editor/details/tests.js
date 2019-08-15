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
                            lessons={this.props.courseLessons}
                            createAction={::this._createTest}
                            editAction={::this._editTest}
                            removeAction={::this._remove}
                            disabled={!enableButtons}/>
    }

    _createTest() {
        this.props.createNewTest(this.props.courseId)
    }

    _editTest(id) {
        this.props.editTest(this.props.courseId, id)
    }

    _remove(id) {
        const _test = this.props.tests.find(item => item.Id === id)

        if (_test) {
            this.props.deleteTest(_test)
        }
    }

}

class CourseTests extends GridControl{

    static propTypes = {
        lessons: PropTypes.array,
    }

    _getId() {
        return 'course-tests';
    }

    _getColumns() {
        let _columns = [
            {id: 'Number', header: '#', width: 30},
            {id: 'Name', header: ['Название', {content:"textFilter"}], fillspace: true},
            {id: 'LessonId', header: 'Лекция', width: 300, editor: 'select',
                options: this._getLessons()},
            {
                id: 'Status', header: ['Состояние', {content:"selectFilter"}], width: 150, editor: 'select',
                options: [{id: '1', value: 'Черновик'},
                    {id: '2', value: 'Опубликованный'},
                    {id: '3', value: 'Архив'}]
            },
            {id: 'TypeName', header: ['Вид теста', {content:"selectFilter"}] , width: 250},
        ];

        _columns.push(...super._getColumns());

        return _columns;
    }

    _getLessons() {
        this.props.lessons.map((lesson) => {
            return {
                id: `${lesson.Id}`,
                value: lesson.Name
            }
        })
    }
}

function mapStateToProps(state) {
    return {
        tests: testsSelector(state),
        courseLessons: state.courseLessons.current,

        enableButtons: enableButtonsSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({createNewTest, editTest, deleteTest}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(CourseTestsWrapper);