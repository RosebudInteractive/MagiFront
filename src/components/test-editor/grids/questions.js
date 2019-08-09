import React from "react";
import PropTypes from "prop-types";
import GridControl from "../../gridControl";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {EDIT_MODE_EDIT} from "../../../constants/Common";
import {enableButtonsSelector} from "adm-ducks/app";
import {createNewQuestion} from "adm-ducks/single-test";

class TocGrid extends React.Component {

    static propTypes = {
        editMode: PropTypes.bool,
    }

    constructor(props) {
        super(props)

        this._selected = null
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.meta.dirty && !nextProps.meta.dirty) {
            this._setObjectsRank(nextProps.input.value)
        }
    }

    render() {

        return <div className="test-questions">
            <TestQuestions createAction={::this._create}
                           editAction={::this._edit}
                           removeAction={::this._remove}
                           moveUpAction={::this._moveUp}
                           moveDownAction={::this._moveDown}
                           editMode={this.props.editMode}
                           selected={this._selected}
                           data={this.props.input.value}
                           disabled={!this.props.enableButtons}/>
        </div>

    }

    _select(id) {
        if (id !== this._selected) {
            this._selected = id;
            this.forceUpdate()
        }
    }

    _create() {
        this.props.createNewQuestion()
    }

    _edit(id) {
        let _toc = this.props.input.value.find((item) => {
            return item.id === parseInt(id)
        });

        this.props.tocActions.edit(_toc);
        this.setState({showDialog: true})
    }

    _save(value) {
        if (this.props.tocEditMode === EDIT_MODE_EDIT) {
            this._update(value)
        } else {
            this._insert(value)
        }

        this.setState({showDialog: false})
        this.props.tocActions.clear();
    }

    _insert(data) {
        let _array = [...this.props.input.value]

        _array.push({...data, id: data.Id});
        this._setObjectsRank(_array)

        this.props.input.onChange(_array)

        this._select(data.Id)
    }

    _update(data) {
        let _array = [...this.props.input.value],
            _index = _array.findIndex((item) => {
                return item.id === +data.id
            })

        if (_index >= 0) {
            _array[_index] = Object.assign({}, data);
        }

        this.props.input.onChange(_array)
    }

    _remove(id) {
        let _array = [...this.props.input.value],
            _index = _array.findIndex((item) => {
                return item.id === +id
            })

        if (_index >= 0) {
            _array.splice(_index, 1)
        }

        this._setObjectsRank(_array)
        this.props.input.onChange(_array)
    }

    _moveUp(id) {
        let _array = [...this.props.input.value],
            _index = _array.findIndex((item) => {
                return item.Id === +id
            }),
            _current = _array[_index]

        if (_index > 0) {
            let _prev = _array[_index - 1],
                _currentNumber = _current.Number;

            _current.Number = _prev.Number
            _prev.Number = _currentNumber

            _array.sort((a, b) => {return a.Number - b.Number})

            this.props.input.onChange(_array)
        }
    }

    _moveDown(id) {
        let _array = [...this.props.input.value],
            _index = _array.findIndex((item) => {
                return item.Id === +id
            }),
            _current = _array[_index]

        if (_index < _array.length - 1) {
            let _next = _array[_index + 1],
                _currentNumber = _current.Number;

            _current.Number = _next.Number
            _next.Number = _currentNumber

            _array.sort((a, b) => {return a.Number - b.Number})

            this.props.input.onChange(_array)
        }
    }

    _setObjectsRank(array) {
        array.forEach((item, index) => {
            if (typeof item === "object") {
                item.Number = index + 1
            }
        })
    }
}


class TestQuestions extends GridControl {

    _getId() {
        return 'test-questions';
    }

    _getColumns() {
        let _columns = [
            {id: 'Number', header: '#', width: 30},
            {id: 'Text', header: 'Текст вопроса', fillspace: true},
        ];

        _columns.push(...super._getColumns());

        return _columns;
    }
}

function mapStateToProps(state) {
    return {
        toc: state.toc.object,
        tocEditMode: state.toc.editMode,

        enableButtons: enableButtonsSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({createNewQuestion}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(TocGrid);