import React, {Component} from 'react';
import Webix from '../components/Webix';
import PropTypes from 'prop-types';
import {EDIT_MODE_EDIT, EDIT_MODE_INSERT} from '../constants/Common'

export default class GridControl extends Component {

    static propTypes = {
        createAction: PropTypes.func,
        addAction: PropTypes.func,
        editAction: PropTypes.func,
        removeAction: PropTypes.func.isRequired,
        moveUpAction: PropTypes.func,
        moveDownAction: PropTypes.func,
        multiUploadAction: PropTypes.func,
        editMode: PropTypes.string,
        viewId: PropTypes.string,
        selected: PropTypes.number,
        data: PropTypes.any.isRequired,
        disabled: PropTypes.bool,
    }

    constructor(props) {
        super(props);

        this._selected = this.props.selected;
        this._isFirstSelected = false;
        this._isLastSelected = false;
    }

    componentWillReceiveProps(nextProps) {
        const _data = nextProps.data;
        if (_data && Array.isArray(_data) && _data.length > 0) {
            const _selected = nextProps.selected;
            if (_selected) {
                this._select({
                    isFirst: _data[0].id === _selected,
                    isLast: _data[_data.length - 1].id === _selected,
                    id: _selected,
                })
            }
        }

        this._saveScrollPos()
    }

    _saveScrollPos() {
        const _grid = window.$$(this._getId())
        if (_grid) {
            this.scroll = window.$$(this._getId()).getScrollState()
        }
    }

    componentDidMount() {
        if (this.props.data && Array.isArray(this.props.data) && this.props.data.length > 0) {
            this._selected = this.props.data[0].Id
            this.forceUpdate()
        }
    }

    componentDidUpdate() {
        const _grid = window.$$(this._getId())
        if (_grid && this.scroll && (this.scroll.x || this.scroll.y)) {
            _grid.scrollTo(this.scroll.x, this.scroll.y)
        }
    }

    _select(selectedObj) {
        this._selectNoRefresh(selectedObj)
        this._saveScrollPos()
        this.forceUpdate()
    }

    _selectNoRefresh(selectedObj) {
        this._isFirstSelected = selectedObj.isFirst;
        this._isLastSelected = selectedObj.isLast;
        this._selected = selectedObj.id;
    }

    _addClicked() {
        this.props.addAction();
    }

    _create() {
        if (this.props.createAction) {
            this.props.createAction();
        }
    }

    _remove(id) {
        this._selected = null;
        this.props.removeAction(id);
    }

    _edit() {
        if ((this._selected) && (this.props.editAction)) {
            this.props.editAction(this._selected);
        }
    }

    _moveUp() {
        if ((this._selected) && (this.props.moveUpAction)) {
            this.props.moveUpAction(this._selected)
        }
    }

    _moveDown() {
        if ((this._selected) && (this.props.moveDownAction)) {
            this.props.moveDownAction(this._selected)
        }
    }

    _upload() {
        if (this.props.multiUploadAction) {
            this.props.multiUploadAction()
        }
    }

    _configButtons() {
        let {
            createAction,
            addAction,
            editAction,
            moveUpAction,
            moveDownAction,
            multiUploadAction,
            editMode,
            disabled,
        } = this.props;

        let _buttons = [];

        let _editMode = typeof editMode === "string" ?
            editMode
            :
            editMode === true ? EDIT_MODE_EDIT : EDIT_MODE_INSERT

        if (createAction) {
            let _disabled = (_editMode !== EDIT_MODE_EDIT) || disabled;
            _buttons.push(<button key='btnNew' className="tool-btn new" disabled={_disabled} onClick={::this._create}/>)
        }

        if (addAction) {
            _buttons.push(<button key='btnAdd' className="tool-btn add" disabled={disabled} onClick={::this._addClicked}/>)
        }

        if (editAction) {
            let _disabled = (!this._selected) || (_editMode !== EDIT_MODE_EDIT) || disabled;
            _buttons.push(<button key='btnEdit' className='tool-btn edit' disabled={_disabled} onClick={::this._edit}/>)
        }

        if (moveUpAction) {
            let _disabled = ((!this._selected) || (this._isFirstSelected)) || disabled;
            _buttons.push(<button key='btnUp' className='tool-btn up' disabled={_disabled} onClick={::this._moveUp}/>)
        }

        if (moveDownAction) {
            let _disabled = ((!this._selected) || (this._isLastSelected)) || disabled;
            _buttons.push(<button key='btnDown' className='tool-btn down' disabled={_disabled}
                                  onClick={::this._moveDown}/>)
        }

        if (multiUploadAction) {
            _buttons.push(<button key='btnUpload' className='tool-btn upload' disabled={disabled} onClick={::this._upload}/>)
        }

        return _buttons;
    }

    render() {
        const {data} = this.props;
        return (
            Array.isArray(data) ?
                <div className="grid-wrapper">
                    <div className="action-bar">
                        {this._configButtons()}
                    </div>
                    <div className="detail-grid-container">
                        <Webix ui={::this.getUI()} data={data}/>
                    </div>

                </div>
                :
                null
        )



    }

    _getColumns() {
        return [{
            id: "",
            template: this.props.disabled ? `<button class='tool-btn del' disabled/>` : `<button class='tool-btn del'/>`,
            width: 50
        }]
    }

    _getId() {
        return ''
    }

    _getScroll() {
        return 'y'
    }

    getUI() {
        let that = this;

        return {
            view: "datatable",
            // scroll: 'y',
            height: 300,
            select: true,
            resizeColumn: true,
            width: 0,
            editable: false,
            columns: that._getColumns(),
            id: that._getId(),
            scroll: that._getScroll(),

            on: {
                onAfterSelect: function (selObj) {
                    if ((parseInt(selObj.id) !== that._selected) && this.getItem(selObj.id)) {
                        that._selected = null;
                        let _obj = {
                            isFirst: this.getFirstId() === selObj.id,
                            isLast: this.getLastId() === selObj.id,
                            id: selObj.id,
                        };
                        that._select(_obj);
                    }
                },
                onAfterRender: function () {
                    let _selected = this.getSelectedId();
                    let _selectedId = parseInt(_selected ? _selected.id : null);
                    if ((that._selected) && this.getItem(that._selected) && (that._selected !== _selectedId)) {
                        this.select(that._selected)

                        let _obj = {
                            isFirst: this.getFirstId() === that._selected,
                            isLast: this.getLastId() === that._selected,
                            id: that._selected,
                        };

                        that._selectNoRefresh(_obj);
                    }
                }
            },

            onClick: {
                del: (e, id) => {
                    this._remove(id.row);
                }
            }
        }
    }

    _formatDate(data) {
        let fn = window.webix.Date.dateToStr("%d.%m.%Y", false);
        return data ? fn(new Date(data)) : '';
    }
}