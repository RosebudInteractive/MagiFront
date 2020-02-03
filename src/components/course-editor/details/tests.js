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

    constructor(props) {
        super(props)

        this._selected = 0
    }

    componentWillReceiveProps(nextProps) {
        const _oldLength = this.props.tests.length,
            _newLength = nextProps.tests.length

        if (_oldLength !== _newLength) {
            if (_newLength > _oldLength) {
                this._selected = _newLength - 1
            } else {
                this._selected = this._selected < _newLength ? this._selected : _newLength - 1
            }
        }
    }

    render() {
        let {tests, editMode, enableButtons} = this.props,
            _selected = tests[this._selected] ? tests[this._selected].Id : null

        return <CourseTests selected={_selected}
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
        const _index = this.props.tests.findIndex(item => item.Id === id)

        if (_index > -1) {
            this._selected = _index
            this.props.deleteTest(this.props.tests[_index])
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
            {id: 'LessonId', header: ['Лекция', {content:"selectFilter"}], width: 300, editor: 'select',
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
        let _list = this.props.lessons.map((lesson) => {
            return {
                id: lesson.Id,
                value: lesson.Name
            }
        })

        _list.unshift({id: -1, value: ' - Без лекции -'})

        return _list
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