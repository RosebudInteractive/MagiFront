import React from 'react'
import ErrorDialog from '../components/dialog/error-dialog';
import {Prompt} from 'react-router-dom';
import BottomControls from '../components/bottom-contols'
// import $ from 'jquery'

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
        this._isChangingEnable = true;
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

    get form() {
        return window.$$('editor-form')
    }

    _initEditMode() {
        this.editMode = EDIT_MODE_EDIT;
        this.objectActions.get(this.objectId);
    }

    _initInsertMode() {
        this.editMode = EDIT_MODE_INSERT;
        // this.objectActions.create(this._getInitStateOfNewObject(this.props))
    }

    _getInitStateOfNewObject() {
        return null
    }

    componentDidUpdate() {
        let _newObjectId = this.props[this.objectName] ? this.props[this.objectName].id : null;
        let _isNeedSwitchMode = (this.editMode === EDIT_MODE_INSERT) && (!!+_newObjectId);

        if (_isNeedSwitchMode) {
            this._switchToEditObject(_newObjectId)
        }

        this._onUpdate();

        let _nonWebixForm = $('.non-webix-form');

        if (_nonWebixForm.length > 0) {
            let _width = $('.webix_form').width()
            _nonWebixForm.width(_width)
        }

        if ($('.field-wrapper').length > 0) {
            $('.field-wrapper').width($('.webix_control').width())
        }
    }

    componentDidMount() {
    }

    _onUpdate() {
    }

    _switchToEditObject(objId) {
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

    UNSAFE_componentWillMount() {
        this._clearObjectInStorage()
    }

    _clearObjectInStorage() {
        this.objectActions.clear();
    }

    _goBack() {
        this.props.history.push(this.getRootRout());
    }

    _save(values) {
        this.objectActions.save(values, this.editMode);
    }

    _changeData(obj) {
        if (this._isChangingEnable) {
            this.objectActions.changeData(obj);
        }
    }

    _cancel() {
        this._dataLoaded = false;
        this.objectActions.cancelChanges();
    }

    _getMainDivClassName() {
        return "object-content";
    }

    render() {
        const {fetching, hasChanges,} = this.props;

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
                            <Prompt when={this._needShowPrompt()}
                                    message={'Есть несохраненные данные.\n Перейти без сохранения?'}/>
                            <div className="control-wrapper">
                                <div id='webix_editors_wrapper' className='webix_editors_wrapper'/>
                                {this._getNonWebixForm()}
                            </div>
                            {this._getWebixForm()}
                            <BottomControls editor={this} hasChanges={hasChanges} onAccept={::this._save}
                                            onCancel={::this._cancel}/>
                        </div>
                }
                <ErrorDialog/>
                {this._getExtDialogs()}
            </div>
        )
    }

    _getNonWebixForm() {
        return null
    }

    _notifyDataLoaded() {
        if (!this._dataLoaded && this.handleChangeDataOnWebixForm) {
            this.handleChangeDataOnWebixForm()
        }
        this._dataLoaded = true;
    }

    _needShowPrompt() {
        return this.props.hasChanges
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

    _getWebixForm() {
    }

    _disableChanging() {
        this._isChangingEnable = false;
    }

    _enableChanging() {
        this._isChangingEnable = true;
    }

    getUI() {
        let that = this;

        return {
            view: "form",
            container: 'webix_editors_wrapper',
            id: 'editor-form',
            minWidth: 500,
            maxWidth: 1000,
            borderless: true,
            autowidth: true,
            css: "editor-form",
            elements: that._getElements(),
            on: {
                onChange: function () {
                    that._changeData(::this.getValues());
                },
                onValues: function () {
                    that._notifyDataLoaded();
                },
            },
        }
    }

    _getElements() {
        let _elems = [];

        _elems.push(
            {
                view: "button",
                name: 'btnBack',
                value: '<<< Назад',
                align: 'center',
                click: () => {
                    this._goBack();
                }
            },
        );

        _elems.push(...this._getExtElements());

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

