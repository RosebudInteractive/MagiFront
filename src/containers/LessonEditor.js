import React  from 'react'
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

import LessonEpisodes from '../components/LessonEpisodes';
import LessonReferences from '../components/LessonReferences'
import ReferenceForm from '../components/ReferenceForm';

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
                lessonActions.createNewLesson({CourseId : courseId, CourseName: course.Name, Number: course.Lessons.length + 1, LessonType:'L'});
            }
        }
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
        this.props.lessonActions.cancelCanges();
    }

    // selectLesson(id) {
    //     // this.props.coursesActions.selectCourse(id);
    // }

    _createRecommendedReferenceDialog(){
        this.props.lessonActions.showEditReferenceDialog(EDIT_MODE_INSERT)
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

    _createRecommendedReference(){
        this.props.referenceActions.createNewReference(true);
    }

    _editRecommendedReference(refId){
        let _ref = this.props.recommendedRef.find((item) => {
            return item.id === refId
        });

        this.props.referenceActions.editReference(_ref);
    }

    _createCommonReference(){
        this.props.referenceActions.createNewReference(false);
    }

    _editCommonReference(refId){
        let _ref = this.props.commonRef.find((item) => {
            return item.id === refId
        });

        this.props.referenceActions.editReference(_ref);
    }

    _removeRecommendedReference(refId){
        this.props.lessonActions.removeRecommendedReference(refId)
    }

    _moveRecommendedReferenceUp(refId){
        this.props.lessonActions.moveRecommendedReferenceUp(refId)
    }

    _moveRecommendedReferenceDown(refId){
        this.props.lessonActions.moveRecommendedReferenceDown(refId)
    }

    _removeCommonReference(refId){
        this.props.lessonActions.removeCommonReference(refId)
    }

    _moveCommonReferenceUp(refId){
        this.props.lessonActions.moveCommonReferenceUp(refId)
    }

    _moveCommonReferenceDown(refId){
        this.props.lessonActions.moveCommonReferenceDown(refId)
    }

    _cancelEditReference(){
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
        } = this.props;

        return (
            fetching ?
                <p>Загрузка...</p>
                :
                <div>
                    <Webix ui={
                            ::this.getUI(::this.saveLesson,
                            ::this._cancelChanges,
                            ::this._changeData,
                            ::this._getHasChanges,
                            _isEditMode)}
                           data={lesson}
                    />

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
                                      createAction={::this._createCommonReference}
                                      editAction={::this._editCommonReference}
                                      removeAction={::this._removeCommonReference}
                                      moveUpAction={::this._moveCommonReferenceUp}
                                      moveDownAction={::this._moveCommonReferenceDown}
                                      data={commonRef}
                    />
                    <LessonReferences message={'Рекомендуемая литература'}
                                      createAction={::this._createRecommendedReference}
                                      editAction={::this._editRecommendedReference}
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

    _getCourseAuthorsArray(){
        return this.props.authors.map((elem) => {
            return {id: elem.id, value: elem.FirstName + ' ' + elem.LastName};
        })
    }

    getUI(saveAction, cancel, changeData, hasChanges) {
        return {
            view: "form",
            width: 700,
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
                    label: "Планируемая дата публикации",
                    name: 'ReadyDate',
                    width: 300,
                    stringResult: true,
                    // on : {
                    //     onBeforeRender: function(obj) {
                    //         alert(obj)
                        // }
                    // }
                },
                {view: "text", name: "ReadyDate", label: "Название урока", placeholder: "Введите название урока(лекции)"},
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
                },
            }
        };
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