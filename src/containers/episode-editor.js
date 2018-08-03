import React from 'react';
import Webix from '../components/Webix';
import PropTypes from 'prop-types';

import * as appActions from "../actions/app-actions";
import * as singleEpisodeActions from "../actions/episode/episode-actions";
import * as singleLessonActions from "../actions/lesson/lesson-actions";
import * as episodeTocActions from '../actions/episode/episode-tocs-actions';
import * as episodeContentActions from '../actions/episode/episode-contents-actions';
import * as tocActions from '../actions/toc-actions';
import * as contentActions from '../actions/content-actions';
import * as workShopActions from '../actions/work-shop-actions';

import {EpisodeToc, EpisodeContent} from '../components/episodeGrids'

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {EDIT_MODE_EDIT, EDIT_MODE_INSERT} from '../constants/Common';
import ObjectEditor, {labelWidth,} from './object-editor';
import {Tabs, TabLink, TabContent} from 'react-tabs-redux';
import EpisodeTocForm from "../components/episode-toc-form";
import EpisodeResourceForm from "../components/episode-content-form";

class EpisodeEditor extends ObjectEditor {

    constructor(props) {
        super(props);
        const {
            lessonActions,
            lessonId,
            courseId,
            lesson
        } = this.props;

        if ((!lesson) || (lesson.id !== lessonId)) {
            lessonActions.get(lessonId, courseId);
        }

        window.webix.protoUI({
                name: 'myUploader',
                $updateProgress: (size, percent) => {
                    if (percent < 100) {
                        window.$$('file-name').getInputNode().style.background = "linear-gradient(to left, #f1f7ff " + (100 - percent) + "%, #75b5ff 0%)"
                    } else {
                        window.$$('file-name').getInputNode().style.background = "none"
                    }

                }
            },
            window.webix.ui.uploader)
    }

    componentWillReceiveProps(next) {
        const {
            lesson,
            episode,
        } = next;

        if (this.editMode === EDIT_MODE_INSERT) {
            if ((lesson) && (!episode)) {
                this.objectActions.create(this._getInitStateOfNewObject(next));
            }
        }
    }

    componentDidMount() {
        if (this.props.isWorkshop) {
            this._openWorkshop()
        }
    }

    componentDidUpdate(prevProps) {
        super.componentDidUpdate(prevProps)

        if (this.props.isWorkshop && !prevProps.isWorkshop) {
            this._openWorkshop()
        }

        if (!this.props.fetching && prevProps.fetching) {
            // this.props.lessonActions.getResources(this.props.lesson.id);
            this._fillFileId()
        }

        if (this.props.isResourcesLoaded && !prevProps.isResourcesLoaded) {
          // this._fillFileId()
        }
    }

    _fillFileId() {
        let {content, resources} = this.props;

        content.forEach((item) => {
            let _resource = resources.find((resource) => {
                return resource.Id === item.ResourceId
            })

            item.FileId = _resource ? _resource.FileId : null;
        })
    }

    getObject() {
        return this.props.episode
    }

    getRootRout() {
        return (this.editMode !== EDIT_MODE_EDIT)
            ?
            this.currentUrl.replace(this._getInsertRout(), '')
            :
            this.currentUrl.replace(this._getEditRout() + this.objectId, '')
    }

    _getEditRout() {
        return '/episodes/edit/';
    }

    _getInsertRout() {
        return '/episodes/new';
    }

    get objectIdPropName() {
        return 'episodeId'
    }

    get objectName() {
        return 'episode'
    }

    get objectActions() {
        return this.props.episodeActions;
    }

    _initEditMode() {
        let _lessonId = !this.props.subLessonId ? this.props.lessonId : this.props.subLessonId
        this.editMode = EDIT_MODE_EDIT;
        this.objectActions.get(this.objectId, _lessonId);
    }

    _initInsertMode() {
        this.editMode = EDIT_MODE_INSERT;
    }

    _getInitStateOfNewObject(props) {
        const {
            lesson,
            isSupp
        } = props;

        let _number = lesson ? (isSupp ? lesson.suppEpisodes.length : lesson.mainEpisodes.length) : 0;
        _number++;
        return {Number: _number, EpisodeType: 'L', Supp: isSupp};
    }

    _save(value) {
        let _file = value.fileInfo ? value.fileInfo.file : value.Audio;
        let _meta = value.fileInfo ? value.fileInfo.info : value.AudioMeta;
        if (_meta) {
            _meta = JSON.stringify(_meta);
        }

        let _obj = {
            id: value.id,
            LessonId: this.props.subLessonId ? this.props.subLessonId : this.props.lessonId,
            Number: value.Number,
            Id: value.id,
            Name: value.Name,
            State: value.State,
            Audio: _file,
            AudioMeta: _meta,
            EpisodeType: value.EpisodeType,
            Transcript: value.Transcript,
            Supp: !!+value.Supp,
            Toc: [],
            Content: [],
        };

        this._fillToc(_obj.Toc);
        this._fillContent(_obj.Content);

        super._save(_obj)
    }

    _fillToc(array) {
        this.props.episodeToc.map((item) => {
            array.push({
                Id: item.Id,
                Number: item.Number,
                StartTime: item.StartTime,
                Topic: item.Topic,
            })
        });
    }

    _fillContent(array) {
        this.props.content.map((item) => {
            array.push({
                Id: item.Id,
                Content: item.Content,
                StartTime: item.StartTime,
                Duration: item.Duration,
                Topic: item.Topic,
                ResourceId: item.ResourceId,
            })
        });
    }

    _editToc(id) {
        let _toc = this.props.episodeToc.find((item) => {
            return item.id === parseInt(id)
        });

        this.props.tocActions.edit(_toc);
    }

    _saveToc(value) {
        let {episodeTocActions, tocEditMode} = this.props;
        (tocEditMode === EDIT_MODE_EDIT) ? episodeTocActions.update(value) : episodeTocActions.insert(value);

        this.props.tocActions.clear();
    }

    _cancelEditToc() {
        this.props.tocActions.clear();
    }

    _editContentItem(id) {
        let _contentItem = this.props.content.find((item) => {
            return item.id === parseInt(id)
        });

        this.props.contentActions.edit(_contentItem);
    }

    _saveContentItem(value) {
        let {episodeContentActions, contentEditMode} = this.props;
        (contentEditMode === EDIT_MODE_EDIT) ? episodeContentActions.update(value) : episodeContentActions.insert(value);

        this.props.contentActions.clear();
    }

    _cancelEditContentItem() {
        this.props.contentActions.clear();
    }

    _openWorkshop() {
        let {lessonId, episodeId, location} = this.props;

        if (lessonId && episodeId) {
            let _object = {
                lessonId: lessonId,
                episodeId: episodeId,
                callingRoute: location.pathname,
            }

            this.props.workShopActions.loadData(_object)
        }
    }

    _getWebixForm() {
        let {
            tocActions,
            episodeTocActions,
            selectedToc,
            episodeToc,
            contentActions,
            episodeContentActions,
            content,
            selectedContent,
        } = this.props;

        let _data = this.getObject();
        return [
            <Webix ui={::this.getUI()} data={_data} key='webix1'/>,
            <Tabs className="tabs tabs-1" renderActiveTabContentOnly={true} key='tab1'>
                <div className="tab-links">
                    <TabLink to="tabToc">Оглавление эпизода</TabLink>
                    <TabLink to="tabContent">Компоненты</TabLink>
                </div>
                <div className="content">
                    <TabContent for="tabToc">
                        <EpisodeToc selectAction={episodeTocActions.select}
                                    createAction={tocActions.create}
                                    editAction={::this._editToc}
                                    removeAction={episodeTocActions.remove}
                                    moveUpAction={episodeTocActions.moveUp}
                                    moveDownAction={episodeTocActions.moveDown}
                                    editMode={this.editMode}
                                    selected={selectedToc}
                                    data={episodeToc}
                        />
                    </TabContent>
                    <TabContent for="tabContent">
                        <EpisodeContent selectAction={episodeContentActions.select}
                                        createAction={contentActions.create}
                                        editAction={::this._editContentItem}
                                        removeAction={episodeContentActions.remove}
                                        moveUpAction={episodeContentActions.moveUp}
                                        moveDownAction={episodeContentActions.moveDown}
                                        editMode={this.editMode}
                                        selected={selectedContent}
                                        data={content}
                        />
                    </TabContent>
                </div>
            </Tabs>
        ]
    }

    _getExtDialogs() {
        let _dialogs = [];
        if (this.props.showTocEditor) {
            _dialogs.push(<EpisodeTocForm
                cancel={::this._cancelEditToc}
                save={::this._saveToc}
                data={this.props.toc}
            />)
        }

        if (this.props.showResourceEditor) {
            _dialogs.push(<EpisodeResourceForm
                cancel={::this._cancelEditContentItem}
                save={::this._saveContentItem}
                data={this.props.contentItem}
                lessonId={this.props.lessonId}
            />)
        }


        return _dialogs;
    }

    _notifyDataLoaded() {
        super._notifyDataLoaded();

        if (!this.props.lessonId || !this.props.episodeId) {
            window.$$('btn-work-shop').disable()
        } else {
            window.$$('btn-work-shop').enable()
        }

        if ((!this.props.episodeId) || this.props.packageUploadProcess) {
            window.$$('btn-upload-package').disable()
        } else {
            window.$$('btn-upload-package').enable()
        }

        if (this.props.packageUploadProcess) {
            window.$$('btn-upload-package').define("value", "Идет импорт эпизода");
            window.$$('btn-upload-package').refresh();
        } else {
            window.$$('btn-upload-package').define("value", "Импорт эпизода из Word XML");
            window.$$('btn-upload-package').refresh();
        }
    }

    _uploadPackage(files) {
        let {lessonId, episodeId} = this.props;

        this.props.episodeActions.uploadPackage({idLesson: lessonId, idEpisode: episodeId, file: files[0]})
    }

    _getExtElements() {
        let that = this;

        return [
            {
                view: "button", name: 'btnShowWorkShop', value: 'Перейти в монтажный стол', id: 'btn-work-shop',
                disabled: (!that.props.lessonId || !that.props.episodeId),
                click: () => {
                    if (!that.props.isWorkshop) {
                        that.props.history.push(that.props.location.pathname + '?workshop')
                    }
                },
            },
            {
                view: "text",
                name: "Name",
                label: "Название эпизода",
                placeholder: "Введите название эпизода",
                labelWidth: labelWidth,
                validate: window.webix.rules.isNotEmpty,
                invalidMessage: "Значение не может быть пустым",
                on: {
                    onChange: function () {
                        that._externalValidate(this);
                    },
                },
            },
            {
                view: "text",
                name: "Number",
                label: "Номер эпизода",
                readonly: true,
                disabled: true,
                labelWidth: labelWidth,
            },
            {
                view: "combo",
                name: "EpisodeType",
                label: "Тип эпизода",
                placeholder: "Выберите тип эпизода",
                options: [{id: 'L', value: 'Лекция'}],
                labelWidth: labelWidth,
                validate: window.webix.rules.isNotEmpty,
                invalidMessage: "Значение не может быть пустым",
                on: {
                    onChange: function () {
                        that._externalValidate(this);
                    },
                },
            },
            {
                cols: [
                    {
                        view: "text",
                        name: "Audio",
                        label: "Аудио-контент",
                        id: 'file-name',
                        placeholder: "",
                        labelWidth: labelWidth,
                        on: {
                            onChange: function () {
                                that._externalValidate(this);
                            },
                        },
                    },
                    {
                        view: "myUploader",
                        id: "file-uploader",
                        type: "iconButton",
                        icon: 'upload',
                        link: "file-name",
                        upload: "/upload",
                        multiple: false,
                        datatype: "json",
                        accept: "audio/*",
                        validate: window.webix.rules.isNotEmpty,
                        invalidMessage: "Значение не может быть пустым",
                        inputHeight: 38,
                        width: 38,
                        on: {
                            onBeforeFileAdd: (item) => {
                                // todo : ЗДЕСЬ ДОЛЖНА БЫТЬ ПРОВЕРКА ТИПА ФАЙЛА
                                let _type = item.file.type.toLowerCase();
                                if (!_type) {
                                    window.webix.message("Поддерживаются только аудио файлы");
                                    return false;
                                }

                                let _metaType = _type.split('/')[0];
                                if (_metaType !== "audio") {
                                    window.webix.message("Поддерживаются только аудио файлы");
                                    return false;
                                }

                                window.$$('btnOk').disable();
                                window.$$('btnCancel').disable();
                            },
                            onUploadComplete: (response) => {
                                window.$$('file-name').setValue(response[0].file);
                            },
                            onFileUploadError: () => {
                                that.props.appActions.showErrorDialog('При загрузке файла произошла ошибка')
                            },
                        }
                    },
                    {
                        view: "button",
                        type: "iconButton",
                        icon: 'trash',
                        inputHeight: 38,
                        width: 38,
                        on: {
                            onClick: () => {

                            },
                        }
                    },
                ]
            },
            {
                view: "checkbox",
                name: "Supp",
                label: "Дополнительный материал",
                readonly: true,
                disabled: true,
                labelWidth: labelWidth,
            },
            {
                view: "combo",
                name: "State",
                label: "Состояние",
                placeholder: "Выберите состояние",
                validate: window.webix.rules.isNotEmpty,
                invalidMessage: "Значение не может быть пустым",
                options: [
                    {id: 'D', value: 'Черновик'},
                    {id: 'R', value: 'Готовый'},
                    {id: 'A', value: 'Архив'}
                ],
                labelWidth: labelWidth,
                on: {
                    onChange: function () {
                        that._externalValidate(this);
                    },
                },
            },
            {
                view: "richtext",
                label: "Транскрипт",
                height: 300,
                width: 500,
                name: "Transcript",
                labelWidth: labelWidth,
            },
            {
                cols: [
                    {
                        view: 'template',
                        // hidden: true,
                        id: 'file-dialog',
                        borderless: true,
                        height: 0,
                        template: () => {
                            return '<input style="display: none" type="file" id="file-dialog" accept=".xml"/>'
                        },
                    },
                    {
                        view: "button",
                        value: "Импорт эпизода из Word XML",
                        name: 'btnUploadPackage',
                        id: 'btn-upload-package',
                        // disabled: (!that.props.episodeId) || that.props.packageUploadProcess,
                        click: function () {
                            $('#file-dialog').unbind("change");
                            $('#file-dialog').bind("change", function () {
                                that._uploadPackage(this.files)
                            });
                            $("#file-dialog").trigger('click');
                        },
                    },
                ]
            }
        ];
    }
}

EpisodeEditor.propTypes = {
    isSupp: PropTypes.bool
};

function mapStateToProps(state, ownProps) {
    return {
        episode: state.singleEpisode.current,
        lesson: state.singleLesson.current,
        packageUploadProcess: state.singleEpisode.packageUploadProcess,

        episodeToc: state.episodeToc.current,
        selectedToc: state.episodeToc.selected,
        showTocEditor: state.toc.showEditor,
        toc: state.toc.object,
        tocEditMode: state.toc.editMode,
        isResourcesLoaded : state.lessonResources.loaded,

        showResourceEditor: state.content.showEditor,
        contentItem: state.content.object,
        contentEditMode: state.content.editMode,

        content: state.episodeContent.current,
        selectedContent: state.episodeContent.selected,
        resources: state.lessonResources.current,

        hasChanges: state.singleEpisode.hasChanges || state.episodeToc.hasChanges || state.episodeContent.hasChanges,

        hasError: state.commonDlg.hasError,
        message: state.commonDlg.message,
        errorDlgShown: state.commonDlg.errorDlgShown,

        episodeId: parseInt(ownProps.match.params.id),
        lessonId: parseInt(ownProps.match.params.lessonId),
        courseId: parseInt(ownProps.match.params.courseId),
        subLessonId: Number(ownProps.match.params.subLessonId),
        fetching: state.singleLesson.fetching || state.singleEpisode.fetching,

        isWorkshop: ownProps.location.search === "?workshop",
        ownProps: ownProps,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        appActions: bindActionCreators(appActions, dispatch),
        episodeActions: bindActionCreators(singleEpisodeActions, dispatch),
        lessonActions: bindActionCreators(singleLessonActions, dispatch),
        episodeTocActions: bindActionCreators(episodeTocActions, dispatch),
        tocActions: bindActionCreators(tocActions, dispatch),
        episodeContentActions: bindActionCreators(episodeContentActions, dispatch),
        contentActions: bindActionCreators(contentActions, dispatch),
        workShopActions: bindActionCreators(workShopActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(EpisodeEditor);