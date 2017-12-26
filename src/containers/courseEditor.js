import React from 'react'
import Webix from '../components/Webix';

import * as singleCourseActions from "../actions/courseActions";
import * as coursesActions from '../actions/coursesListActions';
import * as authorsActions from "../actions/authorsListActions";
import * as categoriesActions from "../actions/categoriesListActions";
import * as languagesActions from "../actions/LanguagesActions";

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { CourseAuthors, CourseCategories, CourseLessons} from '../components/courseGrids'
import LookupDialog from '../components/LookupDialog';
import { Tabs, TabLink, TabContent } from 'react-tabs-redux';
import ObjectEditor, {labelWidth, } from './objectEditor';

class CourseEditor extends ObjectEditor {

    constructor(props) {
        super(props);
        const {
            authorsActions,
            categoriesActions,
            languagesActions,
        } = this.props;

        authorsActions.getAuthors();
        categoriesActions.getCategories();
        languagesActions.getLanguages();
    }

    getObject() {
        return this.props.course
    }

    getRootRout() {
        return '/courses'
    }

    get objectIdPropName() {
        return 'courseId'
    }

    get objectName() {
        return 'course'
    }

    get objectActions() {
        return this.props.courseActions;
    }

    _save(value) {
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

        super._save(_obj);
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

    _getCourseAuthors() {
        const {
            authors,
            courseAuthors
        } = this.props;

        let _courseAuthors = [];

        courseAuthors.map((item) => {
            let _author = authors.find((author) => {
                return author.id === item
            });

            if (_author) {
                _courseAuthors.push(_author);
            }
        });

        return _courseAuthors;
    }

    _getAuthorsList() {
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

    _getCourseCategories() {
        const {
            categories,
            courseCategories
        } = this.props;

        let _courseCategories = [];

        courseCategories.map((item) => {
            let _category = categories.find((category) => {
                return category.id === item
            });

            if (_category) {
                _courseCategories.push(_category);
            }
        });

        return _courseCategories;
    }

    _getCategories() {
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

    _checkLessonsState(newState){
        if (newState === 'P') {
            return this.props.courseLessons.some((lesson) => {
                return lesson.State === 'R'
            })
        } else {
            return true
        }
    }

    getLanguagesArray(){
        return this.props.languages.map((elem) => {
            return {id: elem.id, value: elem.Language};
        })
    }

    _getWebixForm(){
        const {
            courseLessons,
            selectedAuthor,
            selectedCategory,
            selectedLesson,
        } = this.props;

        let _data = this.getObject();
        return [
            <Webix ui={::this.getUI()} data={_data} key='webix1'/>,
            <Tabs className="tabs tabs-1" renderActiveTabContentOnly={true} key='tab1'>
                <div className="tab-links">
                    <TabLink to="tab1">Авторы</TabLink>
                    <TabLink to="tab2">Категории</TabLink>
                    <TabLink to="tab3">Лекции</TabLink>
                </div>
                <div className="content">
                    <TabContent for="tab1">
                        <CourseAuthors addAction={::this.showAddAuthorLookup}
                                       removeAction={::this._removeAuthorFromCourse}
                                       selectAction={::this._selectAuthor}
                                       selected={selectedAuthor}
                                       editMode={this.editMode}
                                       data={::this._getCourseAuthors()}/>
                    </TabContent>
                    <TabContent for="tab2">
                        <CourseCategories addAction={::this.showAddCategoryLookup}
                                          removeAction={::this._removeCategoryFromCourse}
                                          selectAction={::this._selectCategory}
                                          selected={selectedCategory}
                                          editMode={this.editMode}
                                          data={::this._getCourseCategories()}/>
                    </TabContent>
                    <TabContent for="tab3">
                        <CourseLessons data={courseLessons}
                                       selectAction={::this._selectLesson}
                                       createAction={::this._createLesson}
                                       removeAction={::this._removeLessonFromCourse}
                                       editAction={::this._editLesson}
                                       moveUpAction={::this._moveUpLesson}
                                       moveDownAction={::this._moveDownLesson}
                                       editMode={this.editMode}
                                       selected={selectedLesson}
                        />
                    </TabContent>
                </div>
            </Tabs>
        ]
    }

    _getExtDialogs() {
        let _dialogs = [];
        if (this.props.showAddAuthorDialog) {
            _dialogs.push(<LookupDialog
                message='Авторы'
                data={::this._getAuthorsList()}
                yesAction={::this.addAuthorAction}
                noAction={::this.hideAddAuthorDialog}
            />)
        }

        if (this.props.showAddCategoryDialog) {
           _dialogs.push(<LookupDialog
               message='Категориии'
               data={::this._getCategories()}
               yesAction={::this.addCategoryAction}
               noAction={::this.hideAddCategoryDialog}
           />)
        }

        return _dialogs;
    }

    _getExtElements() {
        let that = this;

        return [
            {
                view: "text", name: "Name",
                label: "Название курса",
                placeholder: "Введите название",
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
                labelWidth: labelWidth
            },
            {
                view: "colorpicker",
                label: "Цвет курса",
                name: "ColorHex",
                placeholder: 'Цвет курса',
                labelWidth: labelWidth
            },
            {
                view: "combo",
                name: "State",
                label: "Состояние",
                placeholder: "Выберите состояние",
                options: [
                    {id: 'D', value: 'Черновик'},
                    {id: 'P', value: 'Опубликованный'},
                    {id: 'A', value: 'Архив'}
                    ],
                labelWidth: labelWidth,
                validate: function(value){ return that._checkLessonsState(value) },
                invalidMessage: 'Недопустимое состояние',
                on: {
                    onChange: function () {
                        that._externalValidate(this);
                    },
                },
            },
            {
                view: "combo", name: "LanguageId", label: "Язык", placeholder: "Выберите язык",
                options: this.getLanguagesArray(),
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
                view: "richtext",
                id: "Description",
                label: "Описание курса",
                labelPosition: "top",
                height: 200,
                width: 500,
                name: "Description",
            },
        ];
    }

    _enableApplyChanges() {
        let _enable = super._enableApplyChanges();

        return _enable && (this.props.courseAuthors.length > 0) && (this.props.courseCategories.length > 0)
    }
}

function mapStateToProps(state, ownProps) {
    return {
        authors: state.authorsList.authors,
        selectedAuthor: state.courseAuthors.selected,
        selectedCategory: state.courseCategories.selected,
        selectedLesson: state.courseLessons.selected,
        categories: state.categoriesList.categories,
        course: state.singleCourse.current,
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
        fetching: state.authorsList.fetching || state.categoriesList.fetching || state.languages.fetching || state.singleCourse.fetching
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