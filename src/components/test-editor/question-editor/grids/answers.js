import React from "react";
import PropTypes from "prop-types";
import GridControl from "../../../gridControl";
import {connect} from "react-redux";
import {enableButtonsSelector} from "adm-ducks/app";
import AnswerForm from "../answer-editor/editor";
import {bindActionCreators} from "redux";
import {touch} from "redux-form";

const NEW_ANSWER = {
    Text: null,
    IsCorrect: false
}

class AnswerGrid extends React.Component {

    static propTypes = {
        editMode: PropTypes.bool,
    }

    constructor(props) {
        super(props)

        this._selected = null
        this._internalId = -1
        this._answer = null
        this._answerEditMode = false
        this.state = {
            showDialog: false,
            scrollable: false,
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.meta.dirty && !nextProps.meta.dirty) {
            this._setObjectsRank(nextProps.input.value)
        }
    }

    componentDidMount() {
        this._setObjectsRank(this.props.input.value)
    }

    render() {
        const {meta: {error, touched}} = this.props;

        const _errorText = touched && error &&
            <p className="form__error-message" style={{display: "block"}}>{error}</p>

        return <div className="question-answers">
            <AnswersGrid createAction={::this._create}
                         editAction={::this._edit}
                         removeAction={::this._remove}
                         moveUpAction={::this._moveUp}
                         moveDownAction={::this._moveDown}
                         editMode={this.props.editMode}
                         selected={this._selected}
                         data={this.props.input.value}
                         disabled={!this.props.enableButtons}/>
            {
                this.state.showDialog ?
                    <AnswerForm cancel={::this._cancel}
                                save={::this._save}
                                close={::this._close}
                                data={this._answer}
                                scrollable={this.state.scrollable}
                                onPrevClick={!this._isFirstEdit() ? ::this._editPrev : null}
                                onNextClick={!this._isLastEdit() ? ::this._editNext : null}
                    />
                    :
                    null
            }
            {_errorText}
        </div>

    }

    _isFirstEdit() {
        return this.state.currentIndex === 0
    }

    _isLastEdit() {
        return this.state.currentIndex === this.props.input.value.length - 1
    }

    _editPrev() {
        const _newId = this.props.input.value[this.state.currentIndex - 1].id

        this._select(_newId)
        this._edit(_newId)
    }

    _editNext() {
        const _newId = this.props.input.value[this.state.currentIndex + 1].id

        this._select(_newId)
        this._edit(_newId)
    }

    _select(id) {
        if (id !== this._selected) {
            this._selected = id;
            this.forceUpdate()
        }
    }

    _cancel() {
        this.setState({ showDialog: false })
    }

    _close() {
        this.setState({ showDialog: false })
    }

    _create() {
        this._answer = Object.assign({}, NEW_ANSWER)
        this._answerEditMode = false
        this._answer.Id = this._internalId
        this._answer.id = this._answer.Id
        this._internalId--;

        this.setState({
            showDialog: true,
            scrollable: false
        })
    }

    _edit(id) {
        const _currentIndex = this.props.input.value.findIndex((item) => {
            return item.id === +id
        })

        if (_currentIndex >= 0) {
            let _answer = this.props.input.value[_currentIndex];

            this._answer = Object.assign({}, _answer);
            this._answerEditMode = true
            this.setState({
                showDialog: true,
                scrollable: true,
                currentIndex: _currentIndex,
            })
        }
    }

    _save(value) {
        if (this._answerEditMode) {
            this._update(value)
        } else {
            this._insert(value)
        }

        this.setState({showDialog: false})
        this.props.touch('QuestionEditor', 'Answers')
    }

    _insert(data) {
        let _array = [...this.props.input.value]

        _array.push(data);
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
                return item.id === +id
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
                return item.id === +id
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


class AnswersGrid extends GridControl {

    _getId() {
        return 'question-answers';
    }

    _getColumns() {
        let _columns = [
            {id: 'Number', header: '#', width: 30},
            {id: 'Text', header: 'Текст ответа', fillspace: true},
            {id: 'IsCorrect', header: 'Правильный', width: 110, css: "center", template: "{common.checkbox()}"},
        ];

        _columns.push(...super._getColumns());

        return _columns;
    }
}

function mapStateToProps(state) {
    return {
        enableButtons: enableButtonsSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({touch}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(AnswerGrid);