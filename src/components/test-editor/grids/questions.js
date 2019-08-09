import React from "react";
import PropTypes from "prop-types";
import GridControl from "../../gridControl";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {enableButtonsSelector} from "adm-ducks/app";
import {questionInEditModeSelector, questionsSelector, createNewQuestion} from "adm-ducks/single-test";
import QuestionForm from "../question-editor/editor";

const NEW_QUESTION = {
    AnswTime: 10,
    Text: null,
    Picture: null,
    PictureMeta: null,
    AnswType: 1,
    Score: 1,
    StTime: null,
    EndTime: null,
    AllowedInCourse: null,
    AnswBool: null,
    AnswInt: null,
    AnswText: null,
    CorrectAnswResp: null,
    WrongAnswResp: null,
    Answers: [],
}

class QuestionGrid extends React.Component {

    static propTypes = {
        editMode: PropTypes.bool,
    }

    constructor(props) {
        super(props)

        this._selected = null
        this._question = null
        this._internalId = -1
        this._questionEditMode = false
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
            {
                this.state.showDialog ?
                    <QuestionForm
                        cancel={::this._cancel}
                        save={::this._save}
                        close={::this._close}
                        data={this._question}
                        scrollable={this.state.scrollableResources}
                        onPrevClick={ !this._isFirstEdit() ? ::this._editPrev : null }
                        onNextClick={ !this._isLastEdit() ? ::this._editNext : null }
                    />
                    :
                    null
            }
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
        this._question = Object.assign({}, NEW_QUESTION)
        this._question.Id = this._internalId
        this._question.id = this._question.Id
        this._internalId--;
        this._questionEditMode = false

        this.setState({
            showDialog: true,
            scrollable: false
        })
    }

    _edit(id) {
        this._question = this.props.input.value.find((item) => {
            return item.id === parseInt(id)
        });

        this.setState({showDialog: true})
    }

    _save(value) {
        if (this._questionEditMode) {
            this._update(value)
        } else {
            this._insert(value)
        }

        this.setState({showDialog: false})
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
        toc: questionsSelector(state),
        tocEditMode: questionInEditModeSelector(state),

        enableButtons: enableButtonsSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({createNewQuestion}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(QuestionGrid);