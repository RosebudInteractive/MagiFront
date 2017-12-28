import React  from 'react';
import Webix from '../components/Webix';

import * as singleLessonActions from "../actions/lessonActions";
import * as singleCourseActions from "../actions/courseActions";
import * as referenceActions from '../actions/ReferencesActions';
import * as subLessonsActions from '../actions/subLessonsActions';
import * as lessonResourcesActions from '../actions/lessonResourcesActions';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
    LessonEpisodes,
    LessonReferences,
    LessonSubLessons,
    LessonResources
} from '../components/lessonGrids';
import ReferenceForm from '../components/ReferenceForm';
import {EDIT_MODE_INSERT, EDIT_MODE_EDIT} from '../constants/Common'

import { Tabs, TabLink, TabContent } from 'react-tabs-redux';
import ObjectEditor, {labelWidth, } from './objectEditor';

class LessonEditor extends ObjectEditor {

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
        return '/courses/edit/' + this.props.courseId
    }

    _getEditRout() {
        return '/lessons/edit/';
    }

    get objectIdPropName() {
        return 'lessonId'
    }

    get objectName() {
        return 'lesson'
    }

    get objectActions() {
        return this.props.lessonActions;
    }

    _initEditMode(){
        this.editMode = EDIT_MODE_EDIT;
        this.objectActions.get(this.objectId, this.props.courseId, this.props.parentLessonId);
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
    }

    _getInitStateOfNewObject(props) {
        return {
            CourseId: props.courseId,
            CourseName: props.course.Name,
            Number: props.course.Lessons.length + 1,
            LessonType: 'L'
        }
    }

    _save(value) {
        let _obj = {
            id: value.id,
            CourseId: this.props.courseId,
            Id: value.id,
            Name: value.Name,
            State: value.State,
            AuthorId: value.AuthorId,
            Cover: value.Cover,
            URL: value.URL,
            LessonType: value.LessonType,
            ReadyDate: value.DT_ReadyDate,
            ShortDescription: value.ShortDescription,
            FullDescription: value.FullDescription,
            Episodes: [],
            References: [],
        };

        this._fillEpisodes(_obj.Episodes);
        this._fillReferences(_obj.References);

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

        this.props.suppEpisodes.map((episode) => {
            array.push({
                Id: episode.Id,
                Name: episode.Name,
                State: episode.State,
                Number: episode.Number,
                Supp: true,
            })
        })
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
        this.props.lessonActions.moveMainEpisodeDown(episodeId)
    }

    _moveMainEpisodeUp(episodeId) {
        this.props.lessonActions.moveMainEpisodeUp(episodeId)
    }

    _removeMainEpisode(episodeId) {
        this.props.lessonActions.removeMainEpisode(episodeId)
    }

    _selectMainEpisode(id) {
        this.props.lessonActions.selectMainEpisode(id)
    }

    _newMainEpisode() {
        this.props.history.push(
            '/courses/edit/' + this.props.courseId +
            '/lessons/edit/' + this.props.lessonId +
            '/main-episodes/new');
    }

    _newSuppEpisode() {
        this.props.history.push(
            '/courses/edit/' + this.props.courseId +
            '/lessons/edit/' + this.props.lessonId +
            '/supp-episodes/new/');
    }

    _editEpisode(episodeId) {
        this.props.history.push(
            '/courses/edit/' + this.props.courseId +
            '/lessons/edit/' + this.props.lessonId +
            '/episodes/edit/' + episodeId);
    }

    _selectSuppEpisode(id) {
        this.props.lessonActions.selectSuppEpisode(id)
    }

    _moveSuppEpisodeDown(episodeId) {
        this.props.lessonActions.moveSuppEpisodeDown(episodeId)
    }

    _moveSuppEpisodeUp(episodeId) {
        this.props.lessonActions.moveSuppEpisodeUp(episodeId)
    }

    _removeSuppEpisode(episodeId) {
        this.props.lessonActions.removeSuppEpisode(episodeId)
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
        this.props.lessonActions.selectCommonReference(id)
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
        this.props.lessonActions.selectRecommendedReference(id)
    }

    _removeRecommendedReference(refId) {
        this.props.lessonActions.removeRecommendedReference(refId)
    }

    _moveRecommendedReferenceUp(refId) {
        this.props.lessonActions.moveRecommendedReferenceUp(refId)
    }

    _moveRecommendedReferenceDown(refId) {
        this.props.lessonActions.moveRecommendedReferenceDown(refId)
    }

    _removeCommonReference(refId) {
        this.props.lessonActions.removeCommonReference(refId)
    }

    _moveCommonReferenceUp(refId) {
        this.props.lessonActions.moveCommonReferenceUp(refId)
    }

    _moveCommonReferenceDown(refId) {
        this.props.lessonActions.moveCommonReferenceDown(refId)
    }

    _cancelEditReference() {
        this.props.referenceActions.clearReference();
    }

    _saveReference(value) {
        let {lessonActions, referenceEditMode} = this.props;

        if (value.Recommended) {
            (referenceEditMode === EDIT_MODE_EDIT) ? lessonActions.updateRecommendedReference(value) : lessonActions.insertRecommendedReference(value);
        } else {
            (referenceEditMode === EDIT_MODE_EDIT) ? lessonActions.updateCommonReference(value) : lessonActions.insertCommonReference(value);
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
            let _mainEpisodesReady =  (this.props.mainEpisodes.length > 0) &&this.props.mainEpisodes.every((episode) => {
                return episode.State === 'R'
            });

            let _suppEpisodesReady = (this.props.suppEpisodes.length > 0) && this.props.suppEpisodes.every((episode) => {
                return episode.State === 'R'
            });

            return _mainEpisodesReady && _suppEpisodesReady;
        } else {
            return true
        }
    }

    _selectSubLesson(id) {
        this.props.subLessonsActions.select(id)
    }

    _removeSubLesson(id) {
        this.props.subLessonsActions.remove(id)
    }

    _moveSubLessonUp(id) {
        this.props.subLessonsActions.moveUp(id);
    }

    _moveSubLessonDown(id) {
        this.props.subLessonsActions.moveDown(id);
    }

    _selectResource(id) {
        this.props.resourcesActions.select(id);
    }

    _removeResource(id) {
        this.props.resourcesActions.remove(id);
    }

    _getWebixForm(){
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
        } = this.props;

        let _data = this.getObject();
        return [
            <Webix ui={::this.getUI()} data={_data} key='webix1'/>,
            <Tabs className="tabs tabs-1" renderActiveTabContentOnly={true} key='tab1'>
                <div className="tab-links">
                    <TabLink to="tab1">Эпизоды</TabLink>
                    <TabLink to="tab2">Дополнительные лекции</TabLink>
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
                                        selectAction={::this._selectSubLesson}
                                        // createAction={::this._newSuppEpisode}
                                        // editAction={::this._editEpisode}
                                        removeAction={::this._removeSubLesson}
                                        moveUpAction={::this._moveSubLessonUp}
                                        moveDownAction={::this._moveSubLessonDown}
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
                                         selectAction={::this._selectResource}
                                         // editAction={::this._editRecommendedReference}
                                         removeAction={::this._removeResource}
                                         // moveUpAction={::this._moveResourceUp}
                                         // moveDownAction={::this._moveResourceDown}
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

        return _dialogs;
    }

    _getExtElements() {
        let that = this;

        return [
            {
                view: "text",
                name: "CourseName",
                label: "Название курса",
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
                view: "combo",
                name: "AuthorId",
                label: "Автор",
                placeholder: "Выберите автора",
                options: this._getCourseAuthorsArray(),
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
                template: (obj) => {
                    return '<img src="' + obj.src + '" />'
                },
                data: {src: "/assets/images/avatar.png"},
                height: 100,
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
                validate: function (value) { return that._checkEpisodesState(value) },
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
                width: 300,
                stringResult: true,
                format: this._formatDate,
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
                        // collapsed:true,
                    },
                    // {
                    //     view: "accordionitem",
                    //     headerHeight: 40,
                    //     header: "Полное описание",
                    //     body: {
                    //         view: "richtext",
                    //         labelWidth: 0,
                    //         height: 150,
                    //         width: 0,
                    //         name: "FullDescription",
                    //     },
                    // },
                ]
            },
        ];
    }
}

function mapStateToProps(state, ownProps) {
    return {
        authors: state.courseAuthors.authors,
        lesson: state.singleLesson.current,
        mainEpisodes: state.singleLesson.mainEpisodes,
        suppEpisodes: state.singleLesson.suppEpisodes,
        recommendedRef: state.singleLesson.recommendedRef,
        commonRef: state.singleLesson.commonRef,
        showReferenceEditor: state.references.showEditor,
        reference: state.references.reference,
        referenceEditMode : state.references.editMode,
        course: state.singleCourse.current,
        hasChanges : state.singleLesson.hasChanges || state.subLessons.hasChanges || state.lessonResources.hasChanges,
        selectedMainEpisode: state.lessonEpisodes.mainSelected,
        // selectedSuppEpisode: state.lessonEpisodes.suppSelected,
        selectedCommonRef: state.lessonRefs.commonSelected,
        selectedRecommendedRef: state.lessonRefs.recommendedSelected,

        subLessons: state.subLessons.current,
        selectedSubLesson : state.subLessons.selected,

        resources: state.lessonResources.current,
        selectedResource: state.lessonResources.selected,

        hasError: state.commonDlg.hasError,
        message: state.commonDlg.message,
        errorDlgShown: state.commonDlg.errorDlgShown,

        lessonId: Number(ownProps.match.params.id),
        courseId: Number(ownProps.match.params.courseId),
        fetching: state.courseAuthors.fetching || state.singleLesson.fetching || state.singleCourse.fetching
    }
}

function mapDispatchToProps(dispatch) {
    return {
        lessonActions: bindActionCreators(singleLessonActions, dispatch),
        singleCourseActions: bindActionCreators(singleCourseActions, dispatch),
        referenceActions : bindActionCreators(referenceActions, dispatch),
        subLessonsActions : bindActionCreators(subLessonsActions, dispatch),
        resourcesActions: bindActionCreators(lessonResourcesActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LessonEditor);