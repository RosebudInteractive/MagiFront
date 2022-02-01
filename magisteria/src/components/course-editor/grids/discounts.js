import React from "react";
import PropTypes from "prop-types";
import GridControl from "../../gridControl";
import {touch} from 'redux-form'
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import DiscountEditor from "../discount-editor/editor";
import {enableButtonsSelector} from "adm-ducks/app";

const NEW_DISCOUNT = {
    Id: null,
    DiscountTypeId: 3,
    Perc: 0,
    FirstDate: null,
    LastDate: null,
}

class DiscountGrid extends React.Component {

    static propTypes = {
        editMode: PropTypes.bool,
    }

    constructor(props) {
        super(props)

        this.state = {
            showDialog: false,
            showMultipleUploadDialog: false,
            scrollableResources: false,
        }

        this._selected = null
        this._discount = null
        this._internalId = -1
        this._editMode = false
    }

    render() {

        return <div className="course-discounts">
            <label className="grid-label">Динамические скидки</label>
            <CourseDiscounts selectAction={::this._select}
                             createAction={::this._create}
                             editAction={::this._edit}
                             removeAction={::this._remove}
                             editMode={this.props.editMode}
                             selected={this._selected}
                             data={this.props.input.value}
                             disabled={!this.props.enableButtons}/>
            {
                this.state.showDialog ?
                    <DiscountEditor
                        close={::this._cancel}
                        save={::this._save}
                        data={this._discount}
                        scrollable={this.state.scrollableResources}
                        onPrevClick={ !this._isFirstEdit() ? ::this._editPrev : null }
                        onNextClick={ !this._isLastEdit() ? ::this._editNext : null }
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
        this._discount = Object.assign({}, NEW_DISCOUNT)
        this._discount.Id = this._internalId
        this._discount.id = this._discount.Id
        this._internalId--;
        this._editMode = false

        this.setState({
            showDialog: true,
            scrollableResources: false
        })
    }

    _remove(id) {
        let _array = [...this.props.input.value],
            _index = _array.findIndex((item) => {
                return item.id === +id
            })

        if (_index >= 0) {
            _array.splice(_index, 1)

            this.props.input.onChange(_array)
        }
    }

    _edit(id) {
        const _currentIndex = this.props.input.value.findIndex((item) => {
            return item.id === +id
        })

        if (_currentIndex >= 0) {
            let _discount = this.props.input.value[_currentIndex];

            this._discount = Object.assign({}, _discount);
            this._editMode = true
            this.setState({
                showDialog: true,
                scrollableResources: true,
                currentIndex: _currentIndex,
            })
        }
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

    _isFirstEdit() {
        return this.state.currentIndex === 0
    }

    _isLastEdit() {
        return this.state.currentIndex === this.props.input.value.length - 1
    }

    _save(value) {
        if (this._editMode) {
            this._update(value)
        } else {
            this._insert(value);
        }

        this.setState({showDialog: false})
        this.props.touch('CourseSubscriptionForm', 'DynDiscounts')
    }

    _insert(data) {
        let _array = [...this.props.input.value]

        _array.push({...data, id: data.Id});
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

    _cancel() {
        this.setState({showDialog: false})
    }
}


class CourseDiscounts extends GridControl {

    _getId() {
        return 'course-dyn-discounts';
    }

    _getColumns() {
        let _columns = [
            {id: 'Code', header: ['Код', {content:"textFilter"}], width: 150, sort: 'text'},
            {id: 'Perc', header: ['Скидка, %', {content:"textFilter"}], sort: 'int', width: 100, format: function (value) {
                    return `${value}%`
                }},
            {id: 'TtlMinutes', header: 'Длительность', sort: 'int', width: 150, format: function (value) {
                    return `${Math.round(value / 60)} ч. ${(value % 60)} мин.`
                }},
            {id: 'LastDate', header: 'Дата окончания', width: 150, format: this._formatDate, sort: 'date'},
            {id: 'Description', header: ['Описание', {content:"textFilter"}], fillspace: true, sort: 'text'},
        ];

        _columns.push(...super._getColumns());

        return _columns;
    }

    _formatDate(data) {
        let fn = window.webix.Date.dateToStr("%d.%m.%Y %H:%i", false);
        return data ? fn(new Date(data)) : '';
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

export default connect(mapStateToProps, mapDispatchToProps)(DiscountGrid);
