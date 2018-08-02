import React from 'react'
import PropTypes from 'prop-types'
import Webix from '../components/Webix';
import * as lessonActions from '../actions/lesson/lesson-actions'

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
// import {EDIT_MODE_EDIT} from '../constants/Common';
import ErrorDialog from './ErrorDialog';

class EpisodeResourceForm extends React.Component {

    constructor(props) {
        super(props);
        if (!this.props.isResourcesLoaded)
            this.props.lessonActions.getResources(this.props.lessonId);
    }

    _save(value) {
        value.Id = this.props.data.Id;

        let _contentObj = {};
        if ((!!value.Content) && (value.Content !== '')) {
            _contentObj = JSON.parse(value.Content)
        }
        
        _contentObj.title = value.Name;
        _contentObj.title2 = value.Description;
        value.Content = JSON.stringify(_contentObj);
        this.props.save(value)
    }

    render() {
        const {
            data,
            cancel,
            fetching,
            errorDlgShown,
            message
        } = this.props;

        return (
            <div>
                {
                    fetching ?
                        <p>Загрузка...</p>
                        :
                        <div className="dlg">
                            <div className="dlg-bg">
                            </div>
                            <div className="dlg-window">
                                <Webix ui={::this.getUI(::this._save, cancel)} data={data}/>
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

    _selectResource() {

    }

    _refreshResources(){
        this.props.lessonActions.getResources(this.props.lessonId);
    }

    _getResourceArray() {
        return this.props.resources.map((item) => {
            let _fileId= item.FileId ? item.FileId : '',
                _name = item.Name ? item.Name : item.FileName,
                _separator = ((_fileId !== '') && (_name !== '')) ? ' : ' : '',
                _title = _fileId + _separator + _name;

            return {id: item.id, value: _title}
        })
    }

    getUI(save, cancel) {
        return {
            view: "form", width: 400, elements: [
                {
                    view: "text",
                    labelPosition: "top",
                    name: "Name",
                    label: "Название",
                    placeholder: "Введите название",
                },
                {
                    view: "textarea",
                    labelPosition: "top",
                    height: 150,
                    name: "Description",
                    label: "Описание",
                    placeholder: "Введите описание"
                },
                {
                    cols: [
                        {
                            view: "combo",
                            labelPosition: "top",
                            name: "ResourceId",
                            label: "Ресурса",
                            options : this._getResourceArray(),
                            width: 329,
                        },
                        {rows: [
                            {},
                            {
                                view: "button",
                                type:"iconButton",
                                icon: 'refresh',
                                // value: "R",
                                // background
                                height: 38,
                                click: function () {
                                    this._refreshResources()
                                }
                            },
                        ]}
                    ]
                },
                {
                    view: "combo",
                    labelPosition: "top",
                    name: "CompType",
                    label: "Тип компонента",
                    placeholder: "Введите тип",
                    options : [
                        {id: 'PIC', value: 'Картинка'},
                        {id: 'VDO', value: 'Видео'},
                        {id: 'TXT', value: 'Текст'},
                        {id: 'TLN', value: 'Таймлайн'},
                    ],
                },
                {
                    view: "counter",
                    labelPosition: "top",
                    name: "StartTime",
                    label: "Время начала",
                    placeholder: "",
                },
                {
                    view: "counter",
                    labelPosition: "top",
                    name: "Duration",
                    label: "Длительность",
                    placeholder: "",
                },
                {
                    cols: [
                        {},
                        {
                            view: "button", value: "ОК", click: function () {
                            if (save)
                                save(this.getFormView().getValues());
                        }
                        },
                        {
                            view: "button", value: "Отмена", click: function () {
                            if (cancel)
                                cancel();
                        }
                        }
                    ]
                }
            ]
        }
    }
}

EpisodeResourceForm.propTypes = {
    data: PropTypes.object.isRequired,
    save: PropTypes.func.isRequired,
    cancel: PropTypes.func.isRequired,
    lessonId: PropTypes.number.isRequired,
};

function mapStateToProps(state) {
    return {
        resources: state.lessonResources.current,
        isResourcesLoaded : state.lessonResources.loaded,
        contentEditMode: state.content.editMode,

        fetching: state.lessonResources.fetching
    }
}

function mapDispatchToProps(dispatch) {
    return {
        lessonActions: bindActionCreators(lessonActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(EpisodeResourceForm);