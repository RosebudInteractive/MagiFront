import React  from 'react'
import ErrorDialog from '../components/ErrorDialog';
import {Prompt} from 'react-router-dom';

import {
    EDIT_MODE_INSERT,
    EDIT_MODE_EDIT
} from '../constants/Common';

export const labelWidth = 240;

export default class ObjectEditor extends React.Component {
    constructor(props) {
        super(props);
        this._editMode = EDIT_MODE_INSERT;

        if (this.objectId > 0) {
            this._initEditMode()
        } else {
            this._initInsertMode()
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

    get objectIdPropName() {
        throw 'Undefined object prop name'
    }

    get objectName() {
        throw 'Undefined object name'
    }

    get objectActions() {
        throw 'Undefined object actions'
    }

    get objectId() {
        return this.props[this.objectIdPropName];
    }

    get editMode() {
        return this._editMode;
    }

    set editMode(value) {
        this._editMode = value
    }

    get currentUrl() {
        return this.props.ownProps ? this.props.ownProps.location.pathname : '';
    }

    _initEditMode(){
        this.editMode = EDIT_MODE_EDIT;
        this.objectActions.get(this.objectId);
    }

    _initInsertMode() {
        this.editMode = EDIT_MODE_INSERT;
        // this.objectActions.create(this._getInitStateOfNewObject(this.props))
    }

    _getInitStateOfNewObject(){
        return null
    }

    componentDidUpdate() {
        let _newObjectId = this.props[this.objectName] ? this.props[this.objectName].id : null;
        let _isNeedSwitchMode = (this.editMode === EDIT_MODE_INSERT) && (!!+_newObjectId);

        if (_isNeedSwitchMode) {
            this._switchToEditObject(_newObjectId)
        }

        this._onUpdate();
    }

    componentDidMount() {
        // if (this.objectId > 0) {
        //     this._initEditMode()
        // } else {
        //     this._initInsertMode()
        // }
    }

    _onUpdate() {}

    _switchToEditObject(objId){
        let _newRout = this.getRootRout() + this._getEditRout() + objId;
        this.editMode = EDIT_MODE_EDIT;
        this.props.history.push(_newRout);
    }

    _getEditRout() {
        return '/edit/';
    }

    componentWillUnmount() {
        // window.$$('editor-form').clear()
        // this._clearObjectInStorage()
    }

    componentWillMount() {
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

    _getMainDivClassName(){
        return "object-content";
    }

    render() {
        const {
            fetching,
            message,
            errorDlgShown,
            hasChanges
        } = this.props;

        if (fetching) {
            this._dataLoaded = false;
            this._validateResult = {};
        }

        return (
            <div className={this._getMainDivClassName()}>
                {
                    fetching ?
                        <p>Загрузка...</p>
                        :
                        <div>
                            <Prompt when={hasChanges} message='Есть несохраненные данные. Перейти без сохранения?'/>
                            {this._getWebixForm()}
                        </div>
                }
                {
                    errorDlgShown ?
                        <ErrorDialog
                            message={message}
                        />
                        :
                        ""
                }
                {this._getExtDialogs()}
            </div>
        )
    }

    _notifyDataLoaded() {
        this._dataLoaded = true;
    }

    _hasChanges() {
        return this.props.hasChanges;
    }

    _enableApplyChanges() {
        let _array = Object.values(this._validateResult);
        return _array.every((value) => {
            return value === true
        })
    }

    _getWebixForm(){}

    getUI() {
        let that = this;

        return {
            view: "form",
            id: 'editor-form',
            width: 1000,
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
                        view: "button", value: "ОК", name: 'btnOk', id: 'btnOk',
                        click: function () {
                            if (this.getFormView().validate()) {
                                let _obj = this.getFormView().getValues();

                                let _uploader = window.$$('file-uploader');
                                if (_uploader) {
                                    let _id = window.$$('file-uploader').files.data.order[0];
                                    let _file = window.$$('file-uploader').files.getItem(_id);
                                    if (_file) {
                                        _obj.fileInfo = _file[0];
                                    }
                                }

                                that._save(_obj);
                            }
                        }
                    },
                    {
                        view: "button", value: "Отмена", name: 'btnCancel', id: 'btnCancel',
                        click: function () {
                            this.getFormView().clearValidation();
                            that._cancel();
                        }
                    }
                ]
            }
        );

        return _elems;
    }

    _getExtElements() {
        return [];
    }

    _externalValidate(field) {
        if (this._dataLoaded) {
            this._validateResult[field.data.name] = field.validate();
        }
    }

    _getExtDialogs() {
        return []
    }

    _formatDate(data) {
        let fn = window.webix.Date.dateToStr("%d.%m.%Y", false);
        return data ? fn(new Date(data)) : null;
    }
}

