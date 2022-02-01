import React from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import PropTypes from "prop-types";
import ReferenceDialog from "../dialogs/reference-dialog";
import {clearReference, createNewReference, editReference} from '../../../actions/references-actions';
import {EDIT_MODE_EDIT} from "../../../constants/Common";
import {enableButtonsSelector} from "adm-ducks/app";
import GridControl from "../../gridControl";

class ReferencesGrid extends React.Component {

    static propTypes = {
        editMode: PropTypes.bool,
        title: PropTypes.string,
        viewId: PropTypes.string,
        isRecommended: PropTypes.bool,
    }

    constructor(props) {
        super(props)

        this.state = {
            showEditor: false,
        }

        this._selected = null;
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props.meta.dirty && !nextProps.meta.dirty) {
            this._setObjectsRank(nextProps.input.value)
        }
    }

    render() {
        const {editMode, title, viewId, input} = this.props

        return <div className="lesson-common-refs">
            <label className="grid-label">{title}</label>
            <LessonReferences createAction={::this._create}
                              editAction={::this._edit}
                              removeAction={::this._remove}
                              moveUpAction={::this._moveUp}
                              moveDownAction={::this._moveDown}
                              editMode={editMode}
                              selected={this._selected}
                              data={input.value}
                              viewId={viewId}
                              disabled={!this.props.enableButtons}/>
            {
                this.state.showEditor ?
                    <ReferenceDialog
                        cancel={::this._cancelEditReference}
                        save={::this._saveReference}
                        data={this.props.reference}
                    />
                    :
                    null
            }
        </div>

    }

    _select(id) {
        if (id !== this._selected) {
            this._selected = id;
            this.forceUpdate()
        }
    }

    _create() {
        this.props.actions.createNewReference(this.props.isRecommended);
        this.setState({showEditor: true})
    }

    _edit(refId) {
        let _ref = this.props.input.value.find((item) => {
            return item.id === parseInt(refId)
        });

        this.props.actions.editReference(_ref);
        this.setState({showEditor: true})
    }

    _cancelEditReference() {
        this.props.actions.clearReference();
        this.setState({showEditor: false})
    }

    _saveReference(value) {
        if (this.props.referenceEditMode === EDIT_MODE_EDIT) {
            this._update(value)
        } else {
            this._insert(value)
        }

        this.props.actions.clearReference();
        this.setState({showEditor: false})
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

    _setObjectsRank(array) {
        array.forEach((item, index) => {
            if (typeof item === "object") {
                item.Number = index + 1
            }
        })
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
}

class LessonReferences extends GridControl {

    _getId() {
        return this.props.viewId ? this.props.viewId : 'lesson-refs';
    }

    _getColumns() {
        let _columns = [
            {id: 'Number', header: '#', width: 30, sort: 'int'},
            {id: 'Description', header: ['Описание', {content:"textFilter"}], fillspace: true, sort: 'text'},
            {id: 'URL', header: ['URL', {content:"textFilter"}], width: 120, sort: 'text'},
        ];

        _columns.push(...super._getColumns());

        return _columns;
    }
}

function mapStateToProps(state) {
    return {
        reference: state.references.reference,
        referenceEditMode: state.references.editMode,

        enableButtons: enableButtonsSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({createNewReference, editReference, clearReference,}, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ReferencesGrid);



