import React  from 'react'
import Webix from '../components/Webix';
import ErrorDialog from '../components/ErrorDialog';

import * as singleCourseActions from "../actions/SingleCourseActions";
import * as coursesActions from '../actions/CoursesActions';
import * as authorsActions from "../actions/AuthorActions";
import * as categoriesActions from "../actions/CategoriesActions";
import * as languagesActions from "../actions/LanguagesActions";

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
    EDIT_MODE_INSERT,
    EDIT_MODE_EDIT
} from '../constants/Common';

import { CourseAuthors, CourseCategories, CourseLessons} from '../components/courseGrids'
import LookupDialog from '../components/LookupDialog';

class CourseEditor extends React.Component {

    constructor(props) {
        super(props);
        const {
            courseActions,
            authorsActions,
            categoriesActions,
            languagesActions,
            courseId,
        } = this.props;


        if (courseId > 0) {
            this.editMode = EDIT_MODE_EDIT;
            courseActions.getCourse(courseId);
        } else {
            this.editMode = EDIT_MODE_INSERT;
            courseActions.createNewCoures();
        }
        authorsActions.getAuthors();
        categoriesActions.getCategories();
        languagesActions.getLanguages();
    }

    saveCourse(value) {
        let _obj = {
            id: value.id,
            Id: value.id,
            Name: value.Name,
            State: value.State,
            Cover: value.Cover,
            Color: parseInt(value.ColorHex.substr(1), 16),
            LanguageId: value.LanguageId,
            URL: value.URL,
            Description: value.Description,
            Authors: [],
            Categories : [],
            Lessons:[],
        };

        _obj.Authors.push(...this.props.courseAuthors);
        _obj.Categories.push(...this.props.courseCategories);
        this._fillLessons(_obj.Lessons);

        this.props.coursesActions.saveCourse(_obj, this.editMode)
    }

    _fillLessons(array) {
        this.props.courseLessons.map((lesson) => {
            array.push({
                LessonId: lesson.Id,
                State: lesson.State,
                ReadyDate: new Date(lesson.ReadyDate),
            })
        })
    }

    changeData(data) {
        this.props.courseActions.changeData(data)
    }

    cancelChanges() {
        this.props.courseActions.cancelCanges();
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

    _removeAuthorFromCourse(id) {
        this.props.courseActions.removeAuthor(id)
    }

    _selectAuthor(id) {
        this.props.courseActions.selectAuthor(id)
    }

    getCourseAuthors() {
        const {
            authors,
            courseAuthors
        } = this.props;

        return authors.filter((value) => {
            return courseAuthors.includes(value.id);
        });
    }

    getAuthors() {
        const {
            authors,
            courseAuthors
        } = this.props;


        let _filtered = authors.filter((value) => {
            return !courseAuthors.includes(value.id);
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
        this.props.courseActions.hideAddCategoryDialog();
        this.props.courseActions.addCategory(id);
    }

    _removeCategoryFromCourse(id) {
        this.props.courseActions.removeCategory(id)
    }

    _selectCategory(id) {
        this.props.courseActions.selectCategory(id)
    }

    getCourseCategories() {
        const {
            categories,
            courseCategories
        } = this.props;

        return categories.filter((value) => {
            return courseCategories.includes(value.id);
        });
    }

    getCategories() {
        const {
            categories,
            courseCategories
        } = this.props;

        let _filtered = categories.filter((value) => {
            return !courseCategories.includes(value.id);
        });

        return _filtered.map((element) => {
            return {id: element.id, value: element.Name}
        })
    }

    _getHasChanges() {
        return this.props.hasChanges;
    }

    _selectLesson(id){
        this.props.courseActions.selectLesson(id)
    }

    _editLesson(id) {
        this.props.history.push('/courses/edit/' + this.props.courseId + '/lessons/edit/' + id);
    }

    _createLesson() {
        this.props.history.push('/courses/edit/' + this.props.courseId + '/lessons/new/');
    }

    _moveUpLesson(id) {
        this.props.courseActions.moveLessonUp(id);
    }

    _moveDownLesson(id) {
        this.props.courseActions.moveLessonDown(id);
    }

    _removeLessonFromCourse(id) {
        this.props.courseActions.removeLesson(id)
    }

    render() {
        const {
            course,
            message,
            errorDlgShown,
            showAddAuthorDialog,
            showAddCategoryDialog,
            fetching,
            courseLessons,
            selectedAuthor,
            selectedCategory,
            selectedLesson,
        } = this.props;

        return (
            fetching ?
                <p>Загрузка...</p>
                :
                <div>
                    <Webix ui={::this.getUI(::this.saveCourse, ::this.cancelChanges, ::this.changeData, ::this._getHasChanges)} data={course}/>
                    <CourseAuthors addAction={::this.showAddAuthorLookup}
                                   removeAction={::this._removeAuthorFromCourse}
                                   selectAction={::this._selectAuthor}
                                   selected={selectedAuthor}
                                   data={::this.getCourseAuthors()}/>
                    <CourseCategories addAction={::this.showAddCategoryLookup}
                                      removeAction={::this._removeCategoryFromCourse}
                                      selectAction={::this._selectCategory}
                                      selected={selectedCategory}
                                      data={::this.getCourseCategories()}/>
                    <CourseLessons data={courseLessons}
                                   selectAction={::this._selectLesson}
                                   createAction={::this._createLesson}
                                   // addAction={::this._addLesson}
                                   removeAction={::this._removeLessonFromCourse}
                                   editAction={::this._editLesson}
                                   moveUpAction={::this._moveUpLesson}
                                   moveDownAction={::this._moveDownLesson}
                                   selected={selectedLesson}
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

    getLanguagesArray(){
        return this.props.languages.map((elem) => {
            return {id: elem.id, value: elem.Language};
        })
    }

    getUI(saveAction, cancel, changeData, hasChanges) {
        return {
            view: "form",
            width: 700,
            id: 'mainData',
            elements: [
                {view: "text", name: "Name", label: "Название курса", placeholder: "Введите название",},

                {view: 'text', name: 'URL', label: 'URL', placeholder: "Введите URL"},
                {view: "colorpicker", label: "Цвет курса", name: "ColorHex", placeholder: 'Цвет курса',},
                {
                    view: "combo", name: "State", label: "Состояние", placeholder: "Выберите состояние",
                    options: [{id: 'D', value: 'Черновик'}, {id: 'P', value: 'Опубликованный'}, {id: 'A', value: 'Архив'}]
                },
                {
                    view: "combo", name: "LanguageId", label: "Язык", placeholder: "Выберите язык",
                    options: this.getLanguagesArray()
                },
                {
                    view: "richtext",
                    id: "Description",
                    label: "Описание курса",
                    labelPosition: "top",
                    height: 150,
                    width: 500,
                    name: "Description",
                },
                {
                    cols: [
                        {},
                        {},
                        {
                            view: "button", name: 'btnOk', value: "ОК",
                            click: function() {
                                let _validated = this.getFormView().validate();
                                if ((saveAction) && _validated) {
                                    saveAction(this.getFormView().getValues());
                                }
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
                },
            ],
            rules:{
                "Name" : window.webix.rules.isNotEmpty,
                "ColorHex": window.webix.rules.isNotEmpty,
                "State": window.webix.rules.isNotEmpty
            },
            on: {
                onChange: function () {
                    this.validate();
                    changeData(::this.getValues());
                },
                onValues: function() {
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
        authors: state.authors.authors,
        selectedAuthor: state.courseAuthors.selected,
        selectedCategory: state.courseCategories.selected,
        selectedLesson: state.courseLessons.selected,
        categories: state.categories.categories,
        course: state.singleCourse.course,
        courseAuthors: state.singleCourse.authors,
        courseCategories: state.singleCourse.categories,
        courseLessons: state.singleCourse.lessons,
        editMode: state.courses.editMode,
        languages: state.languages.languages,
        showAddAuthorDialog: state.singleCourse.showAddAuthorDialog,
        showAddCategoryDialog: state.singleCourse.showAddCategoryDialog,
        hasChanges : state.singleCourse.hasChanges,

        hasError: state.commonDlg.hasError,
        message: state.commonDlg.message,
        errorDlgShown: state.commonDlg.errorDlgShown,

        courseId: Number(ownProps.match.params.id),
        fetching: state.authors.fetching || state.categories.fetching || state.languages.fetching || state.singleCourse.fetching
    }
}

function mapDispatchToProps(dispatch) {
    return {
        courseActions: bindActionCreators(singleCourseActions, dispatch),
        authorsActions: bindActionCreators(authorsActions, dispatch),
        categoriesActions: bindActionCreators(categoriesActions, dispatch),
        languagesActions: bindActionCreators(languagesActions, dispatch),
        coursesActions: bindActionCreators(coursesActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CourseEditor);