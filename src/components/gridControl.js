import React, {Component} from 'react';
import Webix from '../components/Webix';
import PropTypes from 'prop-types';
import {EDIT_MODE_EDIT} from '../constants/Common'

export default class GridControl extends Component {

    static propTypes = {
        selectAction: PropTypes.func.isRequired,
        createAction: PropTypes.func,
        addAction: PropTypes.func,
        editAction: PropTypes.func,
        removeAction: PropTypes.func.isRequired,
        moveUpAction: PropTypes.func,
        moveDownAction: PropTypes.func,
        multiUploadAction: PropTypes.func,
        editMode: PropTypes.string,
        selected: PropTypes.number,
        data: PropTypes.any.isRequired,
    }

    constructor(props) {
        super(props);

        this._selected = this.props.selected;
        this._isFirstSelected = false;
        this._isLastSelected = false;
    }

    componentWillReceiveProps(nextProps) {
        // this.needRender = this.props.data.some((item, index) => {
        //     return item.id !== nextProps.data[index].id
        // });

        this._selected = nextProps.selected
    }

    // shouldComponentUpdate(nextProps) {
    //     let _need = this.props.data.some((item, index) => {
    //         return item.id !== nextProps.data[index].id
    //     });
    //
    //     return _need;
    // //     // return true;
    // }

    _select(selectedObj) {
        this._isFirstSelected = selectedObj.isFirst;
        this._isLastSelected = selectedObj.isLast;
        this._selected = selectedObj.id;
        // this.props.selectAction(selectedObj.id);
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
        } = this.props;

        let _buttons = [];
        if (createAction) {
            let _disabled = editMode !== EDIT_MODE_EDIT;
            _buttons.push(<button key='btnNew' className="tool-btn new" disabled={_disabled} onClick={::this._create}/>)
        }

        if (addAction) {
            _buttons.push(<button key='btnAdd' className="tool-btn add" onClick={::this._addClicked}/>)
        }

        if (editAction) {
            let _disabled = (!this._selected) || (editMode !== EDIT_MODE_EDIT);
            _buttons.push(<button key='btnEdit' className='tool-btn edit' disabled={_disabled} onClick={::this._edit}/>)
        }

        if (moveUpAction) {
            let _disabled = ((!this._selected) || (this._isFirstSelected));
            _buttons.push(<button key='btnUp' className='tool-btn up' disabled={_disabled} onClick={::this._moveUp}/>)
        }

        if (moveDownAction) {
            let _disabled = ((!this._selected) || (this._isLastSelected));
            _buttons.push(<button key='btnDown' className='tool-btn down' disabled={_disabled}
                                  onClick={::this._moveDown}/>)
        }

        if (multiUploadAction) {
            _buttons.push(<button key='btnUpload' className='tool-btn upload' onClick={::this._upload}/>)
        }

        return _buttons;
    }

    render() {
        const {data} = this.props;
        return <div>
            {/*{message}*/}
            <div className="dlg-btn-bar">
                {this._configButtons()}
            </div>
            {/*<div className="tab-scroll-box">*/}
            <Webix ui={::this.getUI()} data={data}/>
            {/*</div>*/}
        </div>
    }

    _getColumns() {
        return [{
            id: "",
            template: "<input class='tool-btn del' type='button'>",
            width: 50
        }]
    }

    getUI() {
        let that = this;

        return {
            view: "datatable",
            scroll: 'y',
            height: 300,
            select: true,
            resizeColumn: true,
            width: 0,
            editable: false,
            columns: that._getColumns(),

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