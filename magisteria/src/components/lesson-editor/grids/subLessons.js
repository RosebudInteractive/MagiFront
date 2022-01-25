import React from "react";
import PropTypes from "prop-types";
import history from '../../../history'
import GridControl from "../../gridControl";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {remove, select,} from '../../../actions/subLessonsActions'
import {set} from '../../../actions/lesson/parent-lesson-actions';
import {enableButtonsSelector} from "adm-ducks/app";
import {moveObjectDown, moveObjectUp} from "../../../reducers/tools";

class SublessonsGrid extends React.Component {

    static propTypes = {
        editMode: PropTypes.bool,
    }

    constructor(props) {
        super(props)
        this._seleted = null;
    }

    render() {
        return <div className="lesson-episodes">
            <label className="grid-label">Дополнительные лекции</label>
            <SubLessons selectAction={::this._select}
                        createAction={::this._create}
                        editAction={::SublessonsGrid._edit}
                        removeAction={::this._remove}
                        selected={this._selected}
                        editMode={this.props.editMode}
                        moveUpAction={::this._moveUp}
                        moveDownAction={::this._moveDown}
                        data={this.props.input.value}
                        disabled={!this.props.enableButtons}/>
        </div>

    }

    _select(id) {
        if (id !== this._seleted) {
            this._seleted = id;
            this.forceUpdate()
        }
    }

    _create() {
        this.props.setParentLesson({id: this.props.lesson.id, name: this.props.lesson.Name});
        history.push(window.location.pathname + '/sub-lessons/new')
    }

    _remove(id) {
        let _array = [...this.props.input.value],
            _index = _array.findIndex((item) => {
                return item.id === +id
            })

        if (_index >= 0) {
            _array.splice(_index, 1)
        }

        this.props.input.onChange(_array)
    }

    _moveUp(id) {
        this._selected = id
        let _array = [];
        this.props.input.value.forEach((item) => {_array.push(Object.assign({}, item))});

        let  {resultArray} = moveObjectUp(_array, id)

        this.props.input.onChange(resultArray)
    }

    _moveDown(id) {
        this._selected = id

        let _array = [];
        this.props.input.value.forEach((item) => {_array.push(Object.assign({}, item))});

        let {resultArray} = moveObjectDown(_array, id)

        this.props.input.onChange(resultArray)
    }

    static _edit(id) {
        history.push(window.location.pathname + '/sub-lessons/edit/' + id)
    }
}

class SubLessons extends GridControl {

    _getId() {
        return 'lesson-subs';
    }

    _getColumns() {
        let _columns = [
            {id: 'Number', header: '#', width: 30},
            {id: 'Name', header: ['Название', {content:"textFilter"}], fillspace: true},
            {
                id: 'State', header: ['Состояние', {content:"selectFilter"}], width: 90, editor: 'select',
                options: [{id: 'D', value: 'Черновик'}, {id: 'R', value: 'Готовый'}, {id: 'A', value: 'Архив'}]
            },
            {id: 'LanguageName', header: 'Язык курса', width: 90},
            {id: 'ReadyDate', header: 'Дата готовности', width: 120, format: this._formatDate,},
        ];

        _columns.push(...super._getColumns());

        return _columns;
    }
}

function mapStateToProps(state) {
    return {
        lesson: state.singleLesson.current,
        enableButtons: enableButtonsSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({select, remove, setParentLesson: set}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(SublessonsGrid);
