import React, { Component } from 'react';
import Webix from '../components/Webix';
import PropTypes from 'prop-types';

export default class GridControl extends Component {
    constructor(props) {
        super(props);

        this._selected = this.props.selected;
    }

    componentWillReceiveProps(nextProps) {
        this._selected = nextProps.selected
    }

    _select(id) {
        this.props.selectAction(id);
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

    _configButtons() {

        let _buttons = [];
        if (this.props.createAction) {
            _buttons.push(<button key='btnNew' className="btn-new" onClick={::this._create}/>)
        }

        if (this.props.addAction) {
            _buttons.push(<button key='btnAdd' className="btn-add"  onClick={::this._addClicked}/>)
        }

        if (this.props.editAction) {
            _buttons.push(<button key='btnEdit' className='btn-edit' disabled={(this._selected === null)} onClick={::this._edit}/>)
        }

        if (this.props.moveUpAction) {
            _buttons.push(<button key='btnUp' className='btn-up' disabled={(this._selected === null)} onClick={::this._moveUp}/>)
        }

        if (this.props.moveDownAction) {
            _buttons.push(<button key='btnDown' className='btn-down' disabled={(this._selected === null)} onClick={::this._moveDown}/>)
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
            <Webix ui={::this.getUI()} data={data}/>

        </div>
    }

    _getColumns() {
        return [{
            id: "",
            template: "<input class='delbtn' type='button'>",
            width: 50
        }]
    }

    getUI() {
        let that = this;

        return {
            view: "datatable",
            scroll: false,
            autoheight: true,
            // height: 0,
            select: true,
            width: 0,
            editable: false,
            columns: that._getColumns(),

            on: {
                onAfterSelect: function (selObj) {
                    if (parseInt(selObj.id) !== that._selected) {
                        that._selected = null;
                        that._select(selObj.id);
                    }
                },
                onAfterRender: function () {
                    if ((that._selected) && this.getItem(that._selected)) {
                        this.select(that._selected)
                    }
                }
            },

            onClick: {
                delbtn: (e, id) => {
                    this._remove(id.row);
                }
            }
        }
    }
}

GridControl.propTypes = {
    message: PropTypes.string,
    selectAction: PropTypes.func.isRequired,
    createAction: PropTypes.func,
    addAction: PropTypes.func,
    editAction: PropTypes.func,
    removeAction: PropTypes.func.isRequired,
    moveUpAction: PropTypes.func,
    moveDownAction: PropTypes.func,
    // selected: PropTypes.string,
    data: PropTypes.any.isRequired,
};
