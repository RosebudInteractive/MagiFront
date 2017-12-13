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

import CourseLessons from '../components/CourseLessons';
import CourseAuthors from '../components/CourseAuthors';
import CourseCategories from '../components/CourseCategories';
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
            course
        } = this.props;

        let _filtered = categories.filter((value) => {
            return !course.Categories.includes(value.id);
        });

        return _filtered.map((element) => {
            return {id: element.id, value: element.Name}
        })
    }

    _getHasChanges() {
        return this.props.hasChanges;
    }

    _editLesson(id) {
        this.props.history.push('/lessons/edit/' + id + '/' + this.props.courseId);
    }

    render() {
        const {
            course,
            message,
            errorDlgShown,
            showAddAuthorDialog,
            showAddCategoryDialog,
            fetching,
            courseLessons
        } = this.props;

        return (
            fetching ?
                <p>Загрузка...</p>
                :
                <div>
                    <Webix ui={::this.getUI(::this.saveCourse, ::this.cancelChanges, ::this.changeData, ::this._getHasChanges)} data={course}/>
                    <CourseAuthors addAuthorAction={::this.showAddAuthorLookup}
                                   data={::this.getCourseAuthors()}/>
                    <CourseCategories addCategoryAction={::this.showAddCategoryLookup}
                                      data={::this.getCourseCategories()}/>
                    <CourseLessons data={courseLessons}
                                   editLessonAction={::this._editLesson}/>
                    {/*<Webix ui={::this.getButtons()}/>*/}
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
                {view: "text", name: "Name", label: "Название курса", placeholder: "Введите название"},

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

    getButtons() {
        return {
            view: "form", width : 700, elements: [{
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
        authors: state.authors.authors,
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