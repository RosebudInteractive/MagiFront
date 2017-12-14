import React  from 'react'
import Webix from '../components/Webix';
import ErrorDialog from '../components/ErrorDialog';

import * as singleLessonActions from "../actions/SingleLessonActions";
import * as singleCourseActions from "../actions/SingleCourseActions";

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
    EDIT_MODE_INSERT,
    EDIT_MODE_EDIT
} from '../constants/Common';

import LessonEpisodes from '../components/LessonEpisodes';
import LessonReferences from '../components/LessonReferences'
import LookupDialog from '../components/LookupDialog';

class LessonEditor extends React.Component {

    constructor(props) {
        super(props);
        const {
            lessonActions,
            singleCourseActions,
            lessonId,
            courseId,
        } = this.props;


        if (lessonId > 0) {
            this.editMode = EDIT_MODE_EDIT;
            lessonActions.getLesson(lessonId, courseId);
        } else {
            this.editMode = EDIT_MODE_INSERT;
            lessonActions.createNewLesson(courseId);
        }
        singleCourseActions.getCourseAuthors(courseId);
    }

    saveLesson(value) {
        let _obj = {
            id: value.id,
            CourseId: this.props.courseId,
            Id: value.id,
            Name: value.Name,
            State: value.State,
            AuthorId : value.AuthorId,
            Cover: value.Cover,
            URL: value.URL,
            LessonType: value.LessonType,
            ReadyDate: new Date(value.ReadyDate),
            ShortDescription: value.ShortDescription,
            FullDescription: value.FullDescription,
            Episodes: [],
            References : [],
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
                Number:episode.Number,
                Supp: false,
            })
        });

        this.props.suppEpisodes.map((episode) => {
            array.push({
                Id: episode.Id,
                Name: episode.Name,
                State: episode.State,
                Number:episode.Number,
                Supp: true,
            })
        })
    }

    _fillReferences(array) {
        this.props.recommendedRef.map((reference) => {
            array.push({
                Id: reference.Id,
                Description: reference.Description,
                URL: reference.URL,
                Number:reference.Number,
                Recommended: true,
            })
        });

        this.props.commonRef.map((reference) => {
            array.push({
                Id: reference.Id,
                Description: reference.Description,
                URL: reference.URL,
                Number:reference.Number,
                Recommended: false,
            })
        })
    }

    changeData(data) {
        this.props.lessonActions.changeData(data)
    }
    cancelChanges() {
        this.props.lessonActions.cancelCanges();
    }

    // selectLesson(id) {
    //     // this.props.coursesActions.selectCourse(id);
    // }

    showAddAuthorLookup(){
        this.props.courseActions.showAddAuthorDialog()
    }

    hideAddAuthorDialog() {
        this.props.courseActions.hideAddAuthorDialog()
    }

    addAuthorAction(id) {
        this.props.courseActions.addAuthor(id);
        this.props.courseActions.hideAddAuthorDialog();
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

    addCategoryAction(id) {
        this.props.courseActions.addCategory(id);
        this.props.courseActions.hideAddCategoryDialog();
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

    _editEpisode(episodeId) {
        alert(episodeId);
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

    _createReference(){

    }

    _editReference(){

    }

    _removeRecommendedReference(refId){
        this.props.lessonActions.removeRecommendedReference(refId)
    }

    _moveRecommendedReferenceUp(){

    }

    _moveRecommendedReferenceDown(){

    }

    _removeCommonReference(refId){
        this.props.lessonActions.removeCommonReference(refId)
    }

    render() {
        const {
            lesson,
            message,
            errorDlgShown,
            showAddAuthorDialog,
            showAddCategoryDialog,
            fetching,
            mainEpisodes,
            suppEpisodes,
            recommendedRef,
            commonRef,
        } = this.props;

        return (
            fetching ?
                <p>Загрузка...</p>
                :
                <div>
                    <Webix ui={::this.getUI(::this.saveLesson, ::this.cancelChanges, ::this.changeData, ::this._getHasChanges)} data={lesson}/>
                    <LessonEpisodes message={'Основные эпизоды'}
                                    createAction={::this._editEpisode}
                                    editAction={::this._editEpisode}
                                    removeAction={::this._removeMainEpisode}
                                    moveUpAction={::this._moveMainEpisodeUp}
                                    moveDownAction={::this._moveMainEpisodeDown}
                                    data={mainEpisodes}
                    />
                    <LessonEpisodes message={'Дополнительные эпизоды'}
                                    createAction={::this._editEpisode}
                                    editAction={::this._editEpisode}
                                    removeAction={::this._removeSuppEpisode}
                                    moveUpAction={::this._moveSuppEpisodeUp}
                                    moveDownAction={::this._moveSuppEpisodeDown}
                                    data={suppEpisodes}
                    />
                    <LessonReferences message={'Список литературы'}
                                      createAction={::this._createReference}
                                      editAction={::this._editReference}
                                      removeAction={::this._removeCommonReference}
                                      moveUpAction={::this._moveRecommendedReferenceUp}
                                      moveDownAction={::this._moveRecommendedReferenceDown}
                                      data={commonRef}
                    />
                    <LessonReferences message={'Рекомендуемая литература'}
                                      createAction={::this._createReference}
                                      editAction={::this._editReference}
                                      removeAction={::this._removeRecommendedReference}
                                      moveUpAction={::this._moveRecommendedReferenceUp}
                                      moveDownAction={::this._moveRecommendedReferenceDown}
                                      data={recommendedRef}
                    />
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
                        showAddAuthorDialog ?
                            <LookupDialog
                                message='Авторы'
                                data={::this.getAuthors()}
                                yesAction={::this.addAuthorAction}
                                noAction={::this.hideAddAuthorDialog}
                            />
                            :
                            ''
                    }
                    {
                        showAddCategoryDialog ?
                            <LookupDialog
                                message='Категориии'
                                data={::this.getCategories()}
                                yesAction={::this.addCategoryAction}
                                noAction={::this.hideAddCategoryDialog}
                            />
                            :
                            ''
                    }
                </div>
        )
    }

    _getCourseAuthorsArray(){
        return this.props.authors.map((elem) => {
            return {id: elem.id, value: elem.FirstName + ' ' + elem.LastName};
        })
    }

    getUI(saveAction, cancel){//, changeData, hasChanges) {
        return {
            view: "form",
            width: 600,
            id: 'mainData',
            elements: [
                {view: "text", name: "CourseName", label: "Название курса", readonly: true},
                {view: "text", name: "Number", label: "Номер урока", readonly: true},
                {
                    view: "combo", name: "LessonType", label: "Тип урока", placeholder: "Выберите тип урока",
                    options: [{id: 'L', value: 'Лекция'}]
                },
                {view: "text", name: "Name", label: "Название урока", placeholder: "Введите название урока(лекции)"},
                {
                    view: "combo", name: "AuthorId", label: "Автор", placeholder: "Выберите автора",
                    options: this._getCourseAuthorsArray()
                },
                {
                    template: (obj) => {
                        return '<img src="' + obj.src + '" />'
                    },
                    data: {src: "/assets/images/avatar.png"},
                    height : 100,
                },
                {
                    view: "combo", name: "State", label: "Состояние", placeholder: "Выберите состояние",
                    options: [{id: 'D', value: 'Черновик'}, {id: 'R', value: 'Готовый'}, {id: 'A', value: 'Архив'}]
                },
                {
                    view:"datepicker",
                    // value: new Date(2012, 6, 8),
                    label: "Планируемая дата публикации",
                    // timepicker: true,
                    name: 'ReadyDate',
                    width: 300
                },
                {
                    view: "richtext",
                    // id: "ShortDescription",
                    label: "Краткое описание",
                    // labelPosition: "left",
                    height: 100,
                    width: 500,
                    name: "ShortDescription",
                },
                {
                    view: "richtext",
                    // id: "ShortDescription",
                    label: "Полное описание",
                    // labelPosition: "right",
                    // labelWidth : 50,
                    height: 150,
                    width: 500,
                    name: "FullDescription",
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
            on: {
                onChange: function () {
                    // changeData(::this.getValues());
                },
                onValues: function () {
                    // if (hasChanges()) {
                    //     this.elements.btnOk.enable();
                    //     this.elements.btnCancel.enable()
                    // } else {
                    //     this.elements.btnOk.disable();
                    //     this.elements.btnCancel.disable()
                    // }
                },
            }
        };
    }

    getButtons() {
        return {
            view: "form", width : 600, elements: [{
                cols: [
                    {},
                    {},
                    {
                        view: "button", value: "ОК",
                        click: () => {
                            ::this.saveCourse();
                        }
                    },
                    {
                        view: "button", value: "Отмена", click: function () {
                        // if (cancel)
                        //     cancel();
                    }
                    }
                ]
            }]
        }
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
        // categories: state.categories.categories,
        // course: state.singleCourse.course,
        // courseAuthors: state.singleCourse.authors,
        // courseCategories: state.singleCourse.categories,
        // courseLessons: state.singleCourse.lessons,
        // editMode: state.courses.editMode,
        // languages: state.languages.languages,
        // showAddAuthorDialog: state.singleCourse.showAddAuthorDialog,
        // showAddCategoryDialog: state.singleCourse.showAddCategoryDialog,
        // hasChanges : state.singleCourse.hasChanges,

        hasError: state.commonDlg.hasError,
        message: state.commonDlg.message,
        errorDlgShown: state.commonDlg.errorDlgShown,

        lessonId: Number(ownProps.match.params.id),
        courseId: Number(ownProps.match.params.courseId),
        fetching: state.courseAuthors.fetching || state.singleLesson.fetching, // || state.languages.fetching || state.singleCourse.fetching
    }
}

function mapDispatchToProps(dispatch) {
    return {
        lessonActions: bindActionCreators(singleLessonActions, dispatch),
        singleCourseActions: bindActionCreators(singleCourseActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LessonEditor);