import React from 'react';
import Webix from '../components/Webix';

import * as singleLessonActions from "../actions/lesson/lesson-actions";
import * as lessonMainEpisodesActions from '../actions/lesson/lessonMainEpisodesActions'
import * as lessonCommonRefsActions from '../actions/lesson/lessonCommonRefsActions'
import * as lessonRecommendedRefsActions from '../actions/lesson/lessonRecommendedRefsActions'

import * as singleCourseActions from "../actions/course/courseActions";
import * as referenceActions from '../actions/references-actions';
import * as resourcesActions from '../actions/resources-actions';
import * as subLessonsActions from '../actions/subLessonsActions';
import * as lessonResourcesActions from '../actions/lesson/lesson-resources-actions';
import * as parentLessonActions from '../actions/lesson/parent-lesson-actions';

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {
    LessonEpisodes,
    LessonReferences,
    LessonSubLessons,
    LessonResources
} from '../components/lessonGrids';
import ReferenceForm from '../components/reference-form';
import {EDIT_MODE_INSERT, EDIT_MODE_EDIT} from '../constants/Common'

import {Tabs, TabLink, TabContent} from 'react-tabs-redux';
import ObjectEditor, {labelWidth,} from './object-editor';
import ResourceForm from "../components/resource-form";
import MultiResourceForm from "../components/multi-resource-form";

export class LessonEditor extends ObjectEditor {

    constructor(props) {
        super(props);
        const {
            singleCourseActions,
            courseId,
            course
        } = this.props;

        if ((!course) || (course.id !== courseId)) {
            singleCourseActions.get(courseId);
        }

        singleCourseActions.getCourseAuthors(courseId);
    }

    getObject() {
        return this.props.lesson
    }

    getRootRout() {
        return (this.editMode === EDIT_MODE_INSERT)
            ?
            this.currentUrl.replace(this._getInsertRout(), '')
            :
            this.currentUrl.replace(this._getEditRout() + this.objectId, '')
    }

    _getEditRout() {
        return '/lessons/edit/';
    }

    _getInsertRout() {
        return '/lessons/new/';
    }

    get objectIdPropName() {
        return 'lessonId';
    }

    get objectName() {
        return 'lesson'
    }

    get objectActions() {
        return this.props.lessonActions;
    }

    get parentId() {
        return null
    }

    _initEditMode() {
        this.editMode = EDIT_MODE_EDIT;
        this.objectActions.get(this.objectId, this.props.courseId, this.parentId);
    }

    _initInsertMode() {
        this.editMode = EDIT_MODE_INSERT;
    }

    componentWillReceiveProps(next) {
        const {
            lesson,
            course,
        } = next;

        if (this.editMode === EDIT_MODE_INSERT) {
            if ((course) && (!lesson)) {
                this.objectActions.create(this._getInitStateOfNewObject(next));
            }
        }

        this.cover = lesson ? lesson.Cover : null;
        this.coverMeta = lesson ? lesson.CoverMeta : null;
    }

    _getInitStateOfNewObject(props) {
        return {
            CourseId: props.courseId,
            CourseName: props.course.Name,
            Number: props.course.Lessons ? (props.course.Lessons.length + 1) : 1,
            LessonType: 'L'
        }
    }

    get cover() {
        return this._cover;
    }

    set cover(value) {
        this._cover = value;
    }

    get coverMeta() {
        return this._coverMeta;
    }

    set coverMeta(value) {
        if ((!!value) && (typeof (value) === 'string')) {
            this._coverMeta = JSON.parse(value)
        } else {
            this._coverMeta = value
        }
    }

    _getCoverInfo() {
        let _meta = this.coverMeta;
        return {
            path: _meta ? ('/data/' + (_meta.content.s ? (_meta.path +  _meta.content.s) : this.cover)) : null,
            heightRatio: _meta ? (_meta.size.height / _meta.size.width ) : 0
        };
    }

    _save(value) {
        let _obj = {
            id: value.id,
            CourseId: this.props.courseId,
            Id: value.id,
            Name: value.Name,
            State: value.State,
            AuthorId: value.AuthorId,
            Cover: this.cover,
            CoverMeta: JSON.stringify(this.coverMeta),
            URL: value.URL,
            LessonType: value.LessonType,
            ReadyDate: value.DT_ReadyDate,
            ShortDescription: value.ShortDescription,
            FullDescription: value.FullDescription,
            ParentId: value.CurrParentId,
            IsAuthRequired: value.IsAuthRequired,
            Episodes: [],
            References: [],
            Resources: [],
            Childs: (this.props.subLessons.length > 0) ? [] : null,
        };

        this._fillEpisodes(_obj.Episodes);
        this._fillReferences(_obj.References);
        this._fillResources(_obj.Resources);
        if (this.props.subLessons.length > 0) {
            this._fillChilds(_obj.Childs);
        }

        super._save(_obj)
    }

    _fillEpisodes(array) {
        this.props.mainEpisodes.map((episode) => {
            array.push({
                Id: episode.Id,
                Name: episode.Name,
                State: episode.State,
                Number: episode.Number,
                Supp: false,
            })
        });
    }

    _fillReferences(array) {
        this.props.recommendedRef.map((reference) => {
            let _obj = {};
            if (reference.Id > 0) {
                _obj.Id = reference.Id
            }
            _obj.Description = reference.Description;
            _obj.URL = reference.URL;
            _obj.Number = reference.Number;
            _obj.Recommended = true;

            array.push(_obj);
        });

        this.props.commonRef.map((reference) => {
            let _obj = {};
            if (reference.Id > 0) {
                _obj.Id = reference.Id
            }
            _obj.Description = reference.Description;
            _obj.URL = reference.URL;
            _obj.Number = reference.Number;
            _obj.Recommended = false;

            array.push(_obj);
        })
    }

    _fillResources(array) {
        this.props.resources.map((resource) => {
            array.push({
                Id: resource.Id,
                Description: resource.Description,
                ResLanguageId: (typeof resource.ResLanguageId === "number") ? resource.ResLanguageId : null,
                FileName: resource.FileName,
                Name: resource.Name,
                MetaData: resource.MetaData,
                ResType: resource.ResType,
            })
        });
    }

    _fillChilds(array) {
        this.props.subLessons.map(child => array.push(child));
    }

    hideAddAuthorDialog() {
        this.props.courseActions.hideAddAuthorDialog()
    }

    getAuthors() {
        const {
            authors,
            course
        } = this.props;


        let _filtered = authors.filter((value) => {
            return !course.Authors.includes(value.id);
        });

        return _filtered.map((element) => {
            return {id: element.id, value: element.FirstName + ' ' + element.LastName}
        })
    }

    hideAddCategoryDialog() {
        this.props.courseActions.hideAddCategoryDialog()
    }

    _moveMainEpisodeDown(episodeId) {
        this.props.lessonMainEpisodesActions.moveDown(episodeId)
    }

    _moveMainEpisodeUp(episodeId) {
        this.props.lessonMainEpisodesActions.moveUp(episodeId)
    }

    _removeMainEpisode(episodeId) {
        this.props.lessonMainEpisodesActions.remove(episodeId)
    }

    _selectMainEpisode(id) {
        this.props.lessonMainEpisodesActions.select(id)
    }

    _newMainEpisode() {
        this.props.history.push(this.currentUrl + '/episodes/new');
    }

    _editEpisode(episodeId) {
        this.props.history.push(this.currentUrl + '/episodes/edit/' + episodeId)
    }

    _createRecommendedReference() {
        this.props.referenceActions.createNewReference(true);
    }

    _editRecommendedReference(refId) {
        let _ref = this.props.recommendedRef.find((item) => {
            return item.id === parseInt(refId)
        });

        this.props.referenceActions.editReference(_ref);
    }

    _selectCommonReference(id) {
        this.props.lessonCommonRefsActions.select(id)
    }

    _createCommonReference() {
        this.props.referenceActions.createNewReference(false);
    }

    _editCommonReference(refId) {
        let _ref = this.props.commonRef.find((item) => {
            return item.id === parseInt(refId)
        });

        this.props.referenceActions.editReference(_ref);
    }

    _selectRecommendedReference(id) {
        this.props.lessonRecommendedRefsActions.select(id)
    }

    _removeRecommendedReference(refId) {
        this.props.lessonRecommendedRefsActions.remove(refId)
    }

    _moveRecommendedReferenceUp(refId) {
        this.props.lessonRecommendedRefsActions.moveUp(refId)
    }

    _moveRecommendedReferenceDown(refId) {
        this.props.lessonRecommendedRefsActions.moveDown(refId)
    }

    _removeCommonReference(refId) {
        this.props.lessonCommonRefsActions.remove(refId)
    }

    _moveCommonReferenceUp(refId) {
        this.props.lessonCommonRefsActions.moveUp(refId)
    }

    _moveCommonReferenceDown(refId) {
        this.props.lessonCommonRefsActions.moveDown(refId)
    }

    _cancelEditReference() {
        this.props.referenceActions.clearReference();
    }

    _saveReference(value) {
        let {lessonRecommendedRefsActions, lessonCommonRefsActions, referenceEditMode} = this.props;

        if (value.Recommended) {
            (referenceEditMode === EDIT_MODE_EDIT) ? lessonRecommendedRefsActions.update(value) : lessonRecommendedRefsActions.insert(value);
        } else {
            (referenceEditMode === EDIT_MODE_EDIT) ? lessonCommonRefsActions.update(value) : lessonCommonRefsActions.insert(value);
        }

        this.props.referenceActions.clearReference();
    }

    _getCourseAuthorsArray() {
        return this.props.authors.map((elem) => {
            return {id: elem.id, value: elem.FirstName + ' ' + elem.LastName};
        })
    }

    _checkEpisodesState(newState) {
        if (newState === 'R') {

            return (this.props.mainEpisodes.length > 0) && this.props.mainEpisodes.every((episode) => {
                return episode.State === 'R'
            });
        } else {
            return true
        }
    }

    _moveSubLessonUp(id) {
        this.props.subLessonsActions.moveUp(id);
    }

    _moveSubLessonDown(id) {
        this.props.subLessonsActions.moveDown(id);
    }

    _newSubLesson() {
        let {
            lesson,
            parentLessonActions
        } = this.props;

        parentLessonActions.set({id: lesson.id, name: lesson.Name});
        this._clearObjectInStorage();
        this.props.history.push(
            '/adm/courses/edit/' + this.props.courseId +
            '/lessons/edit/' + this.props.lessonId +
            '/sub-lessons/new');
    }

    _editSubLesson(id) {
        this.props.history.push(
            '/adm/courses/edit/' + this.props.courseId +
            '/lessons/edit/' + this.props.lessonId +
            '/sub-lessons/edit/' + id);
    }

    _selectResource(id) {
        this.props.lessonResourcesActions.select(id);
    }

    _removeResource(id) {
        this.props.lessonResourcesActions.remove(id);
    }

    _createResource() {
        this.props.resourcesActions.create()
    }

    _multiUpload() {
        this.props.resourcesActions.multiUpload()
    }

    _editResource(id) {
        let _resource = this.props.resources.find((item) => {
            return item.id === parseInt(id)
        });

        this.props.resourcesActions.edit(_resource);
    }

    _saveResource(value) {
        let {lessonResourcesActions, resourceEditMode} = this.props;
        (resourceEditMode === EDIT_MODE_EDIT) ? lessonResourcesActions.update(value) : lessonResourcesActions.insert(value);

        this.props.resourcesActions.clear();
    }

    _cancelEditResource() {
        this.props.resourcesActions.clear();
    }

    _cancelUploadResources() {
        this.props.resourcesActions.cancelUpload();
    }

    _finishUploadResource(resources) {
        this.props.lessonResourcesActions.multipleInsert(resources);
        this.props.resourcesActions.finishUpload();
    }

    _getAdditionalTab() {
        return <TabLink to="tab2">Дополнительные лекции</TabLink>
    }

    _getMainDivClassName() {
        return "lesson-content";
    }

    _notifyDataLoaded() {
        super._notifyDataLoaded();

        let _authors = this._getCourseAuthorsArray();
        if (_authors.length === 1) {
            window.$$('author').setValue(_authors[0].id);
        }
    }

    _getWebixForm() {
        const {
            mainEpisodes,
            subLessons,
            resources,
            recommendedRef,
            commonRef,
            selectedMainEpisode,
            selectedSubLesson,
            selectedCommonRef,
            selectedRecommendedRef,
            selectedResource,
            subLessonsActions,
            lessonResourcesActions,
        } = this.props;

        let _data = this.getObject();
        return [
            <div className={this._getMainDivClassName() + 'webix'} key='webix'>
                <Webix ui={::this.getUI()} data={_data} key='webix1'/>
            </div>,
            <Tabs className="tabs tabs-1" renderActiveTabContentOnly={true} key='tab1'>
                <div className="tab-links">
                    <TabLink to="tab1">Эпизоды</TabLink>
                    {/*{*/}
                    {/*!this.isSubLesson ? <TabLink to="tab2">Дополнительные лекции</TabLink> : ''*/}
                    {/*}*/}
                    {this._getAdditionalTab()}

                    <TabLink to="tab3">Список литературы</TabLink>
                    <TabLink to="tab4">Рекомендуемая литература</TabLink>
                    <TabLink to="tab5">Ресурсы</TabLink>
                </div>

                <div className="content">
                    <TabContent for="tab1">
                        <LessonEpisodes message={'Основные эпизоды'}
                                        divName={'MainEpisodesDiv'}
                                        selectAction={::this._selectMainEpisode}
                                        createAction={::this._newMainEpisode}
                                        editAction={::this._editEpisode}
                                        removeAction={::this._removeMainEpisode}
                                        moveUpAction={::this._moveMainEpisodeUp}
                                        moveDownAction={::this._moveMainEpisodeDown}
                                        editMode={this.editMode}
                                        selected={selectedMainEpisode}
                                        data={mainEpisodes}
                        />
                    </TabContent>
                    <TabContent for="tab2">
                        <LessonSubLessons message={'Дополнительные эпизоды'}
                                          divName={'SuppEpisodesDiv'}
                                          selectAction={subLessonsActions.select}
                                          createAction={::this._newSubLesson}
                                          editAction={::this._editSubLesson}
                                          removeAction={subLessonsActions.remove}
                            // moveUpAction={::this._moveSubLessonUp}
                            // moveDownAction={::this._moveSubLessonDown}
                                          editMode={this.editMode}
                                          selected={selectedSubLesson}
                                          data={subLessons}
                        />
                    </TabContent>
                    <TabContent for="tab3">
                        <LessonReferences message={'Список литературы'}
                                          selectAction={::this._selectCommonReference}
                                          createAction={::this._createCommonReference}
                                          editAction={::this._editCommonReference}
                                          removeAction={::this._removeCommonReference}
                                          moveUpAction={::this._moveCommonReferenceUp}
                                          moveDownAction={::this._moveCommonReferenceDown}
                                          editMode={this.editMode}
                                          selected={selectedCommonRef}
                                          data={commonRef}
                        />
                    </TabContent>
                    <TabContent for="tab4">
                        <LessonReferences message={'Рекомендуемая литература'}
                                          selectAction={::this._selectRecommendedReference}
                                          createAction={::this._createRecommendedReference}
                                          editAction={::this._editRecommendedReference}
                                          removeAction={::this._removeRecommendedReference}
                                          moveUpAction={::this._moveRecommendedReferenceUp}
                                          moveDownAction={::this._moveRecommendedReferenceDown}
                                          editMode={this.editMode}
                                          selected={selectedRecommendedRef}
                                          data={recommendedRef}
                        />
                    </TabContent>
                    <TabContent for="tab5">
                        <LessonResources message={'Ресурсы'}
                                         selectAction={lessonResourcesActions.select}
                                         createAction={::this._createResource}
                                         editAction={::this._editResource}
                                         removeAction={lessonResourcesActions.remove}
                                         multiUploadAction={::this._multiUpload}
                                         editMode={this.editMode}
                                         selected={selectedResource}
                                         data={resources}
                        />
                    </TabContent>
                </div>
            </Tabs>
        ]
    }

    _getExtDialogs() {
        let _dialogs = [];
        if (this.props.showReferenceEditor) {
            _dialogs.push(<ReferenceForm
                cancel={::this._cancelEditReference}
                save={::this._saveReference}
                data={this.props.reference}
            />)
        }

        if (this.props.showResourceEditor) {
            _dialogs.push(<ResourceForm
                cancel={::this._cancelEditResource}
                save={::this._saveResource}
                data={this.props.resource}
            />)
        }

        if (this.props.showMultiUploadResourcesEditor) {
            _dialogs.push(<MultiResourceForm
                cancel={::this._cancelUploadResources}
                finish={::this._finishUploadResource}
            />)
        }


        return _dialogs;
    }

    _getExtElements() {
        let that = this;

        return [
            {
                view: "text",
                name: "CourseName",
                label: "Курс",
                readonly: true,
                labelWidth: labelWidth,
                disabled: true
            },
            {
                view: "text",
                name: "Number",
                label: "Номер урока",
                readonly: true,
                labelWidth: labelWidth,
                disabled: true
            },
            {
                view: "combo",
                name: "LessonType",
                label: "Тип урока",
                placeholder: "Выберите тип урока",
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
                view: "text",
                name: "Name",
                label: "Название урока",
                placeholder: "Введите название урока(лекции)",
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
                view: 'text',
                name: 'URL',
                label: 'URL',
                placeholder: "Введите URL",
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
                view: "combo",
                name: "AuthorId",
                id: 'author',
                label: "Автор",
                placeholder: "Выберите автора",
                options: this._getCourseAuthorsArray(),
                // value: this._getCourseAuthorsArray().length === 1 ? this._getCourseAuthorsArray()[0].value : null,
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
                        rows: [
                            {
                                view: "label",
                                label: "Обложка лекции",
                                width: labelWidth,
                                height: 38,
                            }
                        ]

                    },
                    {
                        rows: [
                            {
                                view: 'text',
                                name: 'Cover',
                                id: 'cover-file',
                                // validate: window.webix.rules.isNotEmpty,
                                // invalidMessage: "Значение не может быть пустым",
                                readonly: true,
                                width: 360,
                                on: {
                                    onChange: function () {
                                        that._externalValidate(this);
                                        let _coverTemplate = window.$$('cover_template');
                                        if (!this.getValue()) {
                                            this.show();
                                            _coverTemplate.hide()
                                        } else {
                                            this.hide();
                                            _coverTemplate.show()
                                        }
                                    },
                                },
                            },
                            {
                                view: 'text',
                                name: 'CoverMeta',
                                id: 'cover-meta',
                                hidden: true,
                            },
                            {
                                view: 'template',
                                datatype: 'image',
                                id: 'cover_template',
                                template: (obj) => {
                                    return '<img class="cover" src="' + obj.src + '" />'
                                },
                                width: 360,
                                borderless: true,
                                on: {
                                    onBeforeRender: (object) => {
                                        let _coverInfo = that._getCoverInfo();
                                        object.src = _coverInfo.path;
                                        let _width = window.$$('cover_template').config.width;
                                        window.$$('cover_template').config.height = _width * _coverInfo.heightRatio;
                                        window.$$('cover_template').resize()
                                    },
                                    validate: function (value) {
                                        return that._checkEpisodesState(value)
                                    },
                                }

                            },
                            {}
                        ]


                    },
                    {
                        width: 10,
                    },
                    {
                        view: "uploader",
                        id: "file-uploader",
                        type: "iconButton",
                        icon: 'upload',
                        upload: "/upload",
                        multiple: false,
                        datatype: "json",
                        accept: "image/*",
                        validate: window.webix.rules.isNotEmpty,
                        invalidMessage: "Значение не может быть пустым",
                        inputHeight: 38,
                        width: 38,
                        on: {
                            onBeforeFileAdd: (item) => {
                                let _type = item.file.type.toLowerCase();
                                if (!_type) {
                                    window.webix.message("Поддерживаются только изображения");
                                    return false;
                                }

                                let _metaType = _type.split('/')[0];
                                if (_metaType !== "image") {
                                    window.webix.message("Поддерживаются только изображения");
                                    return false;
                                }

                                window.$$('btnOk').disable();
                                window.$$('btnCancel').disable();
                            },
                            onUploadComplete: (response) => {
                                let _coverMeta = JSON.stringify(response[0].info);
                                window.$$('cover-file').setValue(response[0].file);
                                window.$$('cover-meta').setValue(_coverMeta);
                                window.$$('cover_template').refresh();
                            },
                            onFileUploadError: (file, response) => {
                                console.log(file, response)
                            }

                        }
                    },
                ]
            },
            {
                view: "combo",
                name: "State",
                label: "Состояние",
                placeholder: "Выберите состояние",
                options: [
                    {id: 'D', value: 'Черновик'},
                    {id: 'R', value: 'Готовый'},
                    {id: 'A', value: 'Архив'}
                ],
                labelWidth: labelWidth,
                validate: function (value) {
                    return that._checkEpisodesState(value)
                },
                invalidMessage: 'Недопустимое состояние',
                on: {
                    onChange: function () {
                        that._externalValidate(this);
                    },
                },
            },
            {
                view: "datepicker",
                label: "Планируемая дата публикации",
                name: 'DT_ReadyDate',
                width: 500,
                stringResult: true,
                format: this._formatDate,
                labelWidth: labelWidth,
            },
            {
                view: "checkbox",
                label: "Требуется авторизация",
                name: 'IsAuthRequired',
                labelWidth: labelWidth,
            },
            {
                view: "accordion",
                multi: true,

                rows: [
                    {
                        view: "accordionitem",
                        headerHeight: 40,
                        header: "Краткое описание",
                        body: {
                            view: "richtext",
                            labelWidth: 0,
                            height: 100,
                            width: 0,
                            name: "ShortDescription",
                        },
                    },
                ]
            },
        ];
    }
}

function mapStateToProps(state, ownProps) {
    return {
        authors: state.courseAuthorsList.authors,
        lesson: state.singleLesson.current,

        mainEpisodes: state.lessonMainEpisodes.current,
        recommendedRef: state.lessonRecommendedRefs.current,
        commonRef: state.lessonCommonRefs.current,
        subLessons: state.subLessons.current,
        resources: state.lessonResources.current,
        // parentLesson: state.parentLesson,

        selectedMainEpisode: state.lessonMainEpisodes.selected,
        selectedCommonRef: state.lessonCommonRefs.selected,
        selectedRecommendedRef: state.lessonRecommendedRefs.selected,
        selectedSubLesson: state.subLessons.selected,
        selectedResource: state.lessonResources.selected,

        showReferenceEditor: state.references.showEditor,
        reference: state.references.reference,
        referenceEditMode: state.references.editMode,
        course: state.singleCourse.current,

        showResourceEditor: state.resources.showEditor,
        showMultiUploadResourcesEditor: state.resources.showMultiUploadEditor,
        resource: state.resources.object,
        resourceEditMode: state.resources.editMode,

        hasChanges: state.singleLesson.hasChanges ||
        state.subLessons.hasChanges ||
        state.lessonResources.hasChanges ||
        state.lessonMainEpisodes.hasChanges ||
        state.lessonCommonRefs.hasChanges ||
        state.lessonRecommendedRefs.hasChanges,

        hasError: state.commonDlg.hasError,
        message: state.commonDlg.message,
        errorDlgShown: state.commonDlg.errorDlgShown,

        lessonId: Number(ownProps.match.params.id),
        courseId: Number(ownProps.match.params.courseId),
        subLessonId: Number(ownProps.match.params.subLessonId),
        fetching: state.courseAuthors.fetching || state.singleLesson.fetching || state.singleCourse.fetching,

        ownProps: ownProps,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        lessonActions: bindActionCreators(singleLessonActions, dispatch),
        lessonMainEpisodesActions: bindActionCreators(lessonMainEpisodesActions, dispatch),
        lessonCommonRefsActions: bindActionCreators(lessonCommonRefsActions, dispatch),
        lessonRecommendedRefsActions: bindActionCreators(lessonRecommendedRefsActions, dispatch),
        singleCourseActions: bindActionCreators(singleCourseActions, dispatch),
        referenceActions: bindActionCreators(referenceActions, dispatch),
        subLessonsActions: bindActionCreators(subLessonsActions, dispatch),
        lessonResourcesActions: bindActionCreators(lessonResourcesActions, dispatch),
        resourcesActions: bindActionCreators(resourcesActions, dispatch),
        parentLessonActions: bindActionCreators(parentLessonActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LessonEditor);