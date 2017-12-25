import React  from 'react';
import {Prompt} from 'react-router-dom';
import Webix from '../components/Webix';
import ErrorDialog from '../components/ErrorDialog';

import * as singleLessonActions from "../actions/SingleLessonActions";
import * as singleCourseActions from "../actions/SingleCourseActions";
import * as referenceActions from '../actions/ReferencesActions';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
    EDIT_MODE_INSERT,
    EDIT_MODE_EDIT
} from '../constants/Common';

import { LessonEpisodes, LessonReferences, } from '../components/lessonGrids';
import ReferenceForm from '../components/ReferenceForm';

import { Tabs, TabLink, TabContent } from 'react-tabs-redux';

class LessonEditor extends React.Component {

    constructor(props) {
        super(props);
        const {
            lessonActions,
            singleCourseActions,
            lessonId,
            courseId,
            course
        } = this.props;

        this._currentPage = 'MainEpisodes';

        if ((!course) || (course.id !== courseId)) {
            singleCourseActions.getCourse(courseId);
        }

        if (lessonId > 0) {
            this.editMode = EDIT_MODE_EDIT;
            lessonActions.getLesson(lessonId, courseId);
        } else {
            this.editMode = EDIT_MODE_INSERT;
        }
        singleCourseActions.getCourseAuthors(courseId);
    }

    componentWillReceiveProps(next) {
        const {
            lessonActions,
            courseId,
            lesson,
            course,
        } = next;

        if (this.editMode === EDIT_MODE_INSERT) {
            if ((course) && (!lesson)) {
                lessonActions.createNewLesson({
                    CourseId: courseId,
                    CourseName: course.Name,
                    Number: course.Lessons.length + 1,
                    LessonType: 'L'
                });
            }
        }
    }

    componentWillUnmount() {
        this.props.lessonActions.clearLesson()
    }

    saveLesson(value) {
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

        this.props.lessonActions.saveLesson(_obj, this.editMode)
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

    _changeData(data) {
        this.props.lessonActions.changeData(data)
    }

    _cancelChanges() {
        this._needRevalidate = true;
        this.props.lessonActions.cancelChanges();
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

    showAddCategoryLookup() {
        this.props.courseActions.showAddCategoryDialog();
    }

    hideAddCategoryDialog() {
        this.props.courseActions.hideAddCategoryDialog()
    }

    _getHasChanges() {
        return this.props.hasChanges;
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
            '/main-episode/new');
    }

    _newSuppEpisode() {
        this.props.history.push(
            '/courses/edit/' + this.props.courseId +
            '/lessons/edit/' + this.props.lessonId +
            '/supp-episode/new/');
    }

    _editEpisode(episodeId) {
        this.props.history.push(
            '/courses/edit/' + this.props.courseId +
            '/lessons/edit/' + this.props.lessonId +
            '/episode/edit/' + episodeId);
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

    _goBack() {
        this.props.history.push('/courses/edit/' + this.props.courseId)
    }

    render() {
        let _isEditMode = this.editMode === EDIT_MODE_EDIT;

        const {
            lesson,
            message,
            errorDlgShown,
            showReferenceEditor,
            fetching,
            mainEpisodes,
            suppEpisodes,
            recommendedRef,
            commonRef,
            reference,
            selectedMainEpisode,
            selectedSuppEpisode,
            selectedCommonRef,
            selectedRecommendedRef,
            hasChanges,
        } = this.props;

        return (
            fetching ?
                <p>Загрузка...</p>
                :
                <div>
                    <Prompt when={hasChanges} message='Есть несохраненные данные. Уйти?'/>
                    <Webix ui={
                        ::this.getUI(::this.saveLesson,
                            ::this._cancelChanges,
                            ::this._changeData,
                            ::this._getHasChanges,
                            _isEditMode)}
                           data={lesson}
                    />
                    <Tabs className="tabs tabs-1" renderActiveTabContentOnly={true}>
                        <div className="tab-links">
                            <TabLink to="tab1">Основные эпизоды</TabLink>
                            <TabLink to="tab2">Дополнительные эпизоды</TabLink>
                            <TabLink to="tab3">Список литературы</TabLink>
                            <TabLink to="tab4">Рекомендуемая литература</TabLink>
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
                                                selected={selectedMainEpisode}
                                                data={mainEpisodes}
                                />
                            </TabContent>
                            <TabContent for="tab2">
                                <LessonEpisodes message={'Дополнительные эпизоды'}
                                                divName={'SuppEpisodesDiv'}
                                                selectAction={::this._selectSuppEpisode}
                                                createAction={::this._newSuppEpisode}
                                                editAction={::this._editEpisode}
                                                removeAction={::this._removeSuppEpisode}
                                                moveUpAction={::this._moveSuppEpisodeUp}
                                                moveDownAction={::this._moveSuppEpisodeDown}
                                                selected={selectedSuppEpisode}
                                                data={suppEpisodes}
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
                                                  selected={selectedRecommendedRef}
                                                  data={recommendedRef}
                                />
                            </TabContent>
                        </div>
                    </Tabs>
                    {
                        errorDlgShown ?
                            <ErrorDialog
                                message={message}
                                // data={selected}
                            />
                            :
                            ""
                    }
                    {
                        showReferenceEditor ?
                            <ReferenceForm
                                cancel={::this._cancelEditReference}
                                save={::this._saveReference}
                                data={reference}
                            />
                            :
                            ''
                    }
                </div>
        )
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

    getUI(saveAction, cancel, changeData, hasChanges) {
        let that = this;
        return {
            view: "form",
            width: 700,
            id: 'mainData',
            elements: [
                // {
                //     container: "areaA",
                //     height: 500,
                //     type: "space", padding: 8,
                //
                //     rows: [
                //         {
                //             type: "clean",
                //             rows: [
                //                 {
                //                     borderless: true,
                //                     view: "tabview",
                //                     id: 'tabbar',
                //                     // value: 'listView',
                //                     multiview: true,
                //
                //                     // options: [
                //                     //     {value: 'Основные эпизоды', id: 'MainEpisodes'},
                //                     //     {value: 'Доп. эпизоды', id: 'SuppEpisodes'},
                //                     //     {value: 'Список литературы', id: 'CommonRefs'},
                //                     //     {value: 'Рекомендуемая литература', id: 'RecommendedRefs'},
                //                     // ],
                //
                //                     on: {
                //                         onChange: (newv) => {
                //                             this._changePage(newv);
                //                         },
                //                     },
                //                 },
                //                 {
                //                     cells: [
                //                         {
                //                             header : 'Основные эпизоды',
                //                             body:{
                //                                 id: "MainEpisodes",
                //                                 // template: "<div id='MainEpisodesDiv' />",
                //                                 type: {
                //                                     width: 120
                //                                 },
                //                                 select: true,
                //                             }
                //
                //                         },
                //                         {
                //                             header : '2',
                //                             body: {
                //                                 id: "SuppEpisodes",
                //                                 // template: "<div id='SuppEpisodesDiv'/>",
                //                             }
                //
                //                         },
                //                         {
                //                             header: '3',
                //                             body: {
                //                                 id: "CommonRefs",
                //                                 // template: "<div id='CommonRefsDiv'/>",
                //                             }
                //
                //                         },
                //                         // {
                //                         //     id: "formView",
                //                         //     view: "htmlform",
                //                         //     content: "areaB",
                //                         //     // rules: {
                //                         //     //     title: webix.rules.isNotEmpty,
                //                         //     //     year: webix.rules.isNumber,
                //                         //     //     rank: webix.rules.isNumber
                //                         //     // }
                //                         // },
                //                         // {id: "SuppEpisodes", template: " "}
                //                     ]
                //                 },
                //             ]
                //         }
                //     ]
                // },
                {
                    view: "button", name: 'btnOk', value: '<<< Назад',
                    click: () => {
                        this._goBack();
                    }
                },
                {view: "text", name: "CourseName", label: "Название курса", readonly: true, labelWidth: 120,},
                {view: "text", name: "Number", label: "Номер урока", readonly: true, labelWidth: 120},
                {
                    view: "combo", name: "LessonType", label: "Тип урока", placeholder: "Выберите тип урока",
                    options: [{id: 'L', value: 'Лекция'}],
                    labelWidth: 120,
                },
                {
                    view: "text",
                    name: "Name",
                    label: "Название урока",
                    placeholder: "Введите название урока(лекции)",
                    labelWidth: 120,
                    invalidMessage: "Значение не может быть пустым",
                },
                {
                    view: "combo",
                    name: "AuthorId",
                    label: "Автор",
                    placeholder: "Выберите автора",
                    options: this._getCourseAuthorsArray(),
                    labelWidth: 120,
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
                    options: [{id: 'D', value: 'Черновик'}, {id: 'R', value: 'Готовый'}, {id: 'A', value: 'Архив'}],
                    labelWidth: 120,
                    invalidMessage: 'Недопустимое состояние',
                },
                {
                    view: "datepicker",
                    label: "Планируемая дата публикации",
                    name: 'DT_ReadyDate',
                    width: 300,
                    stringResult: true,
                    format: this.formatDate,
                    labelWidth: 120,
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
                        {
                            view: "accordionitem",
                            headerHeight: 40,
                            header: "Полное описание",
                            body: {
                                view: "richtext",
                                labelWidth: 0,
                                height: 150,
                                width: 0,
                                name: "FullDescription",
                            },
                        },
                    ]
                },
                {
                    cols: [
                        {},
                        {},
                        {
                            view: "button", name: 'btnOk', value: "ОК",
                            click: function () {
                                if (saveAction)
                                    saveAction(this.getFormView().getValues());
                            }
                        },
                        {
                            view: "button", name: 'btnCancel', value: "Отмена",
                            click: function () {
                                if (cancel)
                                    cancel();
                            }
                        }
                    ]
                }
            ],
            rules: {
                "Name": window.webix.rules.isNotEmpty,
                "Number": window.webix.rules.isNotEmpty,
                AuthorId: window.webix.rules.isNotEmpty,
                LessonType: window.webix.rules.isNotEmpty,
                "State": function (value) {
                    return that._checkEpisodesState(value)
                }
            },
            on: {
                onChange: function () {
                    this.validate();
                    changeData(::this.getValues());
                },
                onValues: function () {
                    if (hasChanges()) {
                        this.elements.btnOk.enable();
                        this.elements.btnCancel.enable()
                    } else {
                        this.elements.btnOk.disable();
                        this.elements.btnCancel.disable()
                    }

                    if (that._needRevalidate) {
                        this.validate();
                        that._needRevalidate = false;
                    }
                },
            }
        };
    }

    formatDate(data) {
        let fn = window.webix.Date.dateToStr("%d.%m.%Y", false);
        return fn(new Date(data));
    }
}

function mapStateToProps(state, ownProps) {
    return {
        authors: state.courseAuthors.authors,
        lesson: state.singleLesson.lesson,
        mainEpisodes: state.singleLesson.mainEpisodes,
        suppEpisodes: state.singleLesson.suppEpisodes,
        recommendedRef: state.singleLesson.recommendedRef,
        commonRef: state.singleLesson.commonRef,
        showReferenceEditor: state.references.showEditor,
        reference: state.references.reference,
        referenceEditMode : state.references.editMode,
        course: state.singleCourse.course,
        hasChanges : state.singleLesson.hasChanges,
        selectedMainEpisode: state.lessonEpisodes.mainSelected,
        selectedSuppEpisode: state.lessonEpisodes.suppSelected,
        selectedCommonRef: state.lessonRefs.commonSelected,
        selectedRecommendedRef: state.lessonRefs.recommendedSelected,

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
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LessonEditor);