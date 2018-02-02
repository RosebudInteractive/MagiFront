import React from 'react'
import Webix from '../components/Webix';

import * as singleCourseActions from "../actions/course/courseActions";
import * as courseAuthorsActions from '../actions/course/courseAuthorsActions';
import * as courseCategoriesActions from '../actions/course/courseCategoriesActions';
import * as courseLessonsActions from '../actions/course/courseLessonsActions';

import * as coursesActions from '../actions/coursesListActions';
import * as authorsActions from "../actions/authorsListActions";
import * as categoriesActions from "../actions/categoriesListActions";
import * as languagesActions from "../actions/languages-actions";

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {CourseAuthors, CourseCategories, CourseLessons} from '../components/courseGrids'
import LookupDialog from '../components/LookupDialog';
import {Tabs, TabLink, TabContent} from 'react-tabs-redux';
import ObjectEditor, {labelWidth,} from './object-editor';

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
        return '/adm/courses'
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
            CoverMeta: JSON.stringify(this.coverMeta),
            Color: parseInt(value.ColorHex.substr(1), 16),
            LanguageId: value.LanguageId,
            URL: value.URL,
            Description: value.Description,
            Authors: [],
            Categories: [],
            Lessons: [],
        };

        _obj.Authors.push(...this.props.courseAuthors);
        _obj.Categories.push(...this.props.courseCategories);
        this._fillLessons(_obj.Lessons);

        super._save(_obj);
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

    _onUpdate() {
        let _course = this.getObject();
        this.cover = _course ? _course.Cover : null;
        this.coverMeta = _course ? _course.CoverMeta : null;
    }

    _getCoverInfo() {
        let _meta = this.coverMeta;
        return {
            path: _meta ? ('/data/' + _meta.path + _meta.content.s) : null,
            heightRatio: _meta ? (_meta.size.height / _meta.size.width ) : 0
        };
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

    showAddAuthorLookup() {
        this.props.courseAuthorsActions.showAddDialog()
    }

    hideAddAuthorDialog() {
        this.props.courseAuthorsActions.hideAddDialog()
    }

    addAuthorAction(id) {
        this.props.courseAuthorsActions.add(id);
        // this.props.courseAuthorsActions.hideAddDialog();
    }

    _removeAuthorFromCourse(id) {
        this.props.courseAuthorsActions.remove(id)
    }

    _selectAuthor(id) {
        this.props.courseAuthorsActions.select(id)
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
        this.props.courseCategoriesActions.showAddDialog();
    }

    hideAddCategoryDialog() {
        this.props.courseCategoriesActions.hideAddDialog()
    }

    addCategoryAction(id) {
        // this.props.courseCategoriesActions.hideAddCategoryDialog();
        this.props.courseCategoriesActions.add(id);
    }

    _removeCategoryFromCourse(id) {
        this.props.courseCategoriesActions.remove(id)
    }

    _selectCategory(id) {
        this.props.courseCategoriesActions.select(id)
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

    _selectLesson(id) {
        this.props.courseLessonsActions.select(id)
    }

    _editLesson(id) {
        this.props.history.push('/adm/courses/edit/' + this.props.courseId + '/lessons/edit/' + id);
    }

    _createLesson() {
        this.props.history.push('/adm/courses/edit/' + this.props.courseId + '/lessons/new/');
    }

    _moveUpLesson(id) {
        this.props.courseLessonsActions.moveUp(id);
    }

    _moveDownLesson(id) {
        this.props.courseLessonsActions.moveDown(id);
    }

    _removeLessonFromCourse(id) {
        this.props.courseLessonsActions.remove(id)
    }

    _checkLessonsState(newState) {
        if (newState === 'P') {
            return this.props.courseLessons.some((lesson) => {
                return lesson.State === 'R'
            })
        } else {
            return true
        }
    }

    getLanguagesArray() {
        return this.props.languages.map((elem) => {
            return {id: elem.id, value: elem.Language};
        })
    }

    _getWebixForm() {
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
                validate: function (value) {
                    return that._checkLessonsState(value)
                },
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
                                validate: window.webix.rules.isNotEmpty,
                                invalidMessage: "Значение не может быть пустым",
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
                                window.$$('cover-meta').setValue(_coverMeta);
                                window.$$('cover-file').setValue(response[0].file);
                                window.$$('cover_template').refresh();
                            },

                        }
                    },
                ]
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
        course: state.singleCourse.current,

        authors: state.authorsList.authors,
        categories: state.categoriesList.categories,

        courseAuthors: state.courseAuthors.current,
        courseCategories: state.courseCategories.current,
        courseLessons: state.courseLessons.current,

        selectedAuthor: state.courseAuthors.selected,
        selectedCategory: state.courseCategories.selected,
        selectedLesson: state.courseLessons.selected,

        editMode: state.courses.editMode,
        languages: state.languages.languages,
        showAddAuthorDialog: state.courseAuthors.showAddDialog,
        showAddCategoryDialog: state.courseCategories.showAddDialog,
        hasChanges: state.singleCourse.hasChanges ||
        state.courseAuthors.hasChanges ||
        state.courseCategories.hasChanges ||
        state.courseLessons.hasChanges,

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
        courseAuthorsActions: bindActionCreators(courseAuthorsActions, dispatch),
        courseCategoriesActions: bindActionCreators(courseCategoriesActions, dispatch),
        courseLessonsActions: bindActionCreators(courseLessonsActions, dispatch),

        authorsActions: bindActionCreators(authorsActions, dispatch),
        categoriesActions: bindActionCreators(categoriesActions, dispatch),
        languagesActions: bindActionCreators(languagesActions, dispatch),
        coursesActions: bindActionCreators(coursesActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CourseEditor);