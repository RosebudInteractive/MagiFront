import React  from 'react'
import Webix from '../components/Webix';
import ErrorDialog from '../components/ErrorDialog';

import * as singleCourseActions from "../actions/SingleCourseActions";
import * as authorsActions from "../actions/AuthorActions";
import * as categoriesActions from "../actions/CategoriesActions";
import * as languagesActions from "../actions/LanguagesActions";

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
// import {EDIT_MODE_INSERT } from '../constants/Common';
import Lessons from './Lessons';
import CourseAuthors from '../components/CourseAuthors';
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

        courseActions.getCourse(courseId);
        authorsActions.getAuthors();
        categoriesActions.getCategories();
        languagesActions.getLanguages();
    }

    // saveCourse(values) {
    //     // this.props.coursesActions.saveCourse(values, this.props.editMode)
    // }

    cancelEdit() {
        // this.props.coursesActions.hideEditDialog();
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

    render() {
        const {
            course,
            message,
            errorDlgShown,
            showAddAuthorDialog,
        } = this.props;

        return (
            <div>
                <Webix ui={::this.getUI()} data={course}/>
                <CourseAuthors addAuthorAction={::this.showAddAuthorLookup} data={::this.getCourseAuthors()}/>
                <Lessons/>
                <Webix ui={::this.getButtons()} />
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
            </div>
        )
    }

    getLanguagesArray(){
        return this.props.languages.map((elem) => {
            return {id: elem.id, value: elem.Language};
        })
    }

    getUI() {
        let _options = this.getLanguagesArray();

        return {
            view: "form", width: 0, elements: [
                {template : "<img src='#Cover#'/>"},
                // {template: "#Cover#", data: {title: "Image One", src: "#Cover#"}},
                {view: "text", name: "Name", label: "Название курса", placeholder: "Введите название"},
                {view: "colorpicker", label: "Цвет курса", name: "ColorHex", placeholder: 'Цвет курса',},
                {
                    view: "combo", name: "State", label: "Состояние", placeholder: "Выберите состояние",
                    options: [{id: 'D', value: 'Черновик'}, {id: 'Опубликованный'}, {id: 'A', value: 'Архив'}]
                },
                {view: "combo", name: "LanguageId", label: "Язык", placeholder: "Выберите язык",
                    options : _options},

                {
                    view: "richtext",
                    id: "Description",
                    label: "Описание курса",
                    labelPosition: "top",
                    height: 150,
                    width: 500,
                    name: "Description",
                },
            ]
        }
    }

    getButtons() {
        return {
            view: "form", width : 500, elements: [{
                cols: [
                    {},
                    {},
                    {
                        view: "button", value: "ОК", click: function () {
                        // if (save)
                        //     save(this.getFormView().getValues());
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
        authors : state.authors.authors,
        course: state.singleCourse.course,
        courseAuthors : state.singleCourse.authors,
        editMode: state.singleCourse.editMode,
        languages: state.languages.languages,
        showAddAuthorDialog : state.singleCourse.showAddAuthorDialog,

        hasError: state.commonDlg.hasError,
        message: state.commonDlg.message,
        errorDlgShown: state.commonDlg.errorDlgShown,

        courseId: Number(ownProps.match.params.id),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        courseActions: bindActionCreators(singleCourseActions, dispatch),
        authorsActions: bindActionCreators(authorsActions, dispatch),
        categoriesActions: bindActionCreators(categoriesActions, dispatch),
        languagesActions: bindActionCreators(languagesActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CourseEditor);