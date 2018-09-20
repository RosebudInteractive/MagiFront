import React from 'react'
import PropTypes from 'prop-types'
import Webix from '../components/Webix';
import * as languagesActions from "../actions/languages-actions";
import ErrorDialog from './ErrorDialog';

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import * as appActions from "../actions/app-actions";

class ResourceForm extends React.Component {

    static propTypes = {
        finish: PropTypes.func.isRequired,
        cancel: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props);
        this._files = [];
        this._uploadedCount = 0;
    }

    componentDidMount() {
        window.$$("file-uploader").fileDialog();
    }

    _clearFiles() {
        this._files = [];
        this._uploadedCount = 0;
    }

    _stop() {
        this._files.forEach((file) => {
            if (!file.uploaded) {
                window.$$("file-uploader").stopUpload(file.id)
            }
        })

        this._completeUploadResources()
    }

    _cancel() {
        this._files.forEach((file) => {
            if (!file.uploaded) {
                window.$$("file-uploader").stopUpload(file.id)
            }
        })

        if (this.props.cancel) {
            this.props.cancel()
        }
    }

    _completeUpload(id, response) {
        let _file = this._files.find(item => item.id === id)

        if (_file) {
            if (!_file.uploaded) {
                this._uploadedCount++
            }

            _file.uploaded = true;
            _file.Name = response[0].info.name ? response[0].info.name : null;
            _file.MetaData = JSON.stringify(response[0].info);
            _file.FileName = response[0].file;
            _file.Description = response[0].info.description ? response[0].info.description : null;
            _file.FileId = response[0].info.fileId ? response[0].info.fileId : null;
            _file.Language = '';
            _file.ResType = 'P';
        }

        window.$$('label').define("label", 'Загружено ' + this._uploadedCount + ' из ' + this._files.length);
        window.$$('label').refresh();
    }

    _completeUploadResources() {
        if (this.props.finish) {
            this.props.finish(this._files.filter( file => file.uploaded))
        }
    }

    render() {
        const {
            errorDlgShown,
            message
        } = this.props;

        return (
            <div>
                {
                    <div className="dlg">
                        <div className="dlg-bg">
                        </div>
                        <div className="dlg-window">
                            <Webix ui={::this.getUI(::this._stop, ::this._cancel)}/>
                        </div>
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
            </div>
        )
    }

    getUI(stop, cancel) {
        let that = this;

        return {
            view: "form",
            width: 400,
            elements: [
                {
                    cols: [
                        {
                            view: "label",
                            id: 'label',
                            label: "Загружено 0 из 0",
                            align: "left",
                            width: 329,
                        },
                        {
                            view: "uploader",
                            id: "file-uploader",
                            apiOnly: true,
                            upload: "/api/adm/upload",
                            multiple: true,
                            datatype: "json",
                            accept: "image/*",
                            type: "iconButton",
                            icon: 'upload',
                            height: 38,
                            on: {
                                onItemClick: () => {
                                    that._clearFiles();
                                    window.$$('res-form-btnStop').disable()
                                },
                                onBeforeFileAdd: (item) => {
                                    let _type = item.file.type.toLowerCase();
                                    if (!_type) {
                                        window.webix.message("Поддерживаются только изображения");
                                        return false;
                                    }

                                    let _metaType = _type.split('/')[0];
                                    if (_metaType !== "image") { // && _metaType !== 'video') {
                                        window.webix.message("Поддерживаются только изображения");
                                        return false;
                                    }

                                    that._files.push({id: item.id})
                                    window.$$('res-form-btnStop').enable()
                                },
                                onUploadComplete: () => {
                                    that._completeUploadResources()
                                },
                                onFileUpload: (file, response) => {
                                    that._completeUpload(file.id, response)
                                },
                                onFileUploadError: () => {
                                    window.$$('res-form-btnCancel').enable();
                                    that.props.appActions.showErrorDialog('При загрузке файла произошла ошибка')
                                }
                            }
                        },
                    ]
                },


                {
                    cols: [
                        {},
                        {
                            view: "button", value: "Стоп", id: 'res-form-btnStop', disabled: true,
                            click: function () {
                                if (stop)
                                    stop();
                            }
                        },
                        {
                            view: "button", value: "Отмена", id: 'res-form-btnCancel',
                            click: function () {
                                if (cancel)
                                    cancel();
                            }
                        }
                    ]
                }
            ],
        }
    }
}


function mapStateToProps(state) {
    return {
        message: state.commonDlg.message,
        errorDlgShown: state.commonDlg.errorDlgShown,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        appActions: bindActionCreators(appActions, dispatch),
        languagesActions: bindActionCreators(languagesActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ResourceForm);

