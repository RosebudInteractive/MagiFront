import React  from 'react'
import ErrorDialog from '../components/ErrorDialog';

import {
    EDIT_MODE_INSERT,
    EDIT_MODE_EDIT
} from '../constants/Common';

class ObjectEditor extends React.Component {
    constructor(props) {
        super(props);
        this._editMode = EDIT_MODE_INSERT;

        if (this.objectId > 0) {
            this.initEditMode()
        } else {
            this.initInsertMode()
        }

        this._validateResult = {};
        this._dataLoaded = false;
    }

    getObject() {
        throw 'Undefined object'
    }

    getRootRout() {
        throw 'Undefined rout'
    }

    get objectName() {
        throw 'Undefined object name'
    }

    get objectActions() {
        throw 'Undefined object actions'
    }

    get objectId() {
        return this.getObject().id;
    }

    get editMode() {
        return this._editMode;
    }

    set editMode(value) {
        this._editMode(value)
    }

    initEditMode(){
        this.editMode = EDIT_MODE_EDIT;
    }

    initInsertMode() {
        this.editMode = EDIT_MODE_INSERT;
    }

    componentWillReceiveProps(next) {
        let _newObjectId = next[this.objectName].id;
        let _isNeedSwitchMode = (this.editMode === EDIT_MODE_INSERT) && (_newObjectId);

        if (_isNeedSwitchMode) {
            this._switchToEditObject(_newObjectId)
        }
    }

    _switchToEditObject(objId){
        let _newRout = this.getRootRout() + objId;
        this.editMode = EDIT_MODE_EDIT;
        this.props.history.push(_newRout);
    }

    componentWillUnmount() {
        this._clearObjectInStorage()
    }

    _clearObjectInStorage() {
        this.objectActions.clear();
    }

    _goBack(){
        this.props.history.push(this.getRootRout());
    }

    _save(values) {
        this.objectActions.save(values, this.editMode);
    }

    _changeData(obj) {
        this.objectActions.changeData(obj);
    }

    _cancel() {
        this._dataLoaded = false;
        this.objectActions.cancelChanges();
    }

    render() {
        const {
            author,
            message,
            errorDlgShown,
        } = this.props;
        return (
            <div className="object-content">
                {this._getWebixForm()}
                {/*<Webix ui={::this.getUI()} data={author}/>*/}
                {
                    errorDlgShown ?
                        <ErrorDialog
                            message={message}
                        />
                        :
                        ""
                }
            </div>
        )
    }

    _notifyDataLoaded() {
        this._dataLoaded = true;
    }

    _hasChanges() {
        return false;
    }

    _enableApplyChanges() {
        return false;
    }

    _getWebixForm(){}

    getUI() {
        let that = this;

        return {
            view: "form",
            width: 700,
            elements: that._getElements(),
            on: {
                onChange: function () {
                    that._changeData(::this.getValues());
                },
                onValues: function () {
                    that._notifyDataLoaded();

                    that._hasChanges() ?
                        this.elements.btnCancel.enable() : this.elements.btnCancel.disable();

                    (that._hasChanges() && that._enableApplyChanges()) ?
                        this.elements.btnOk.enable() : this.elements.btnOk.disable();
                },
            }
        }
    }

    _getElements() {
        let that = this;
        let _elems = [];

        _elems.push(
            {
                view: "button", name: 'btnOk', value: '<<< Назад',
                click: () => {
                    this._goBack();
                }
            },
        );

        _elems.push(...this._getExtElements());

        _elems.push(
            {
                cols: [
                    {},
                    {},
                    {
                        view: "button", value: "ОК", name: 'btnOk',
                        click: function () {
                            if (this.getFormView().validate()) {
                                that._save(this.getFormView().getValues());
                            }
                        }
                    },
                    {
                        view: "button", value: "Отмена", name: 'btnCancel',
                        click: function () {
                            this.getFormView().clearValidation();
                            that._cancel();
                        }
                    }
                ]
            }
        )
    }

    _getExtElements() {
        return [];
    }
}

