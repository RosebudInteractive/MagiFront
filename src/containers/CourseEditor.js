import React  from 'react'
import Webix from '../components/Webix';
import ErrorDialog from '../components/ErrorDialog';

import * as singleCourseActions from "../actions/CoursesActions";
import * as authorsActions from "../actions/AuthorActions";
import * as categoriesActions from "../actions/CategoriesActions";
import * as languagesActions from "../actions/LanguagesActions";

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
// import {EDIT_MODE_INSERT } from '../constants/Common';
import Lessons from './Lessons';

class CourseEditor extends React.Component {
    componentDidMount(){
        const {
            courseActions,
            authorsActions,
            categoriesActions,
            languagesActions,
        } = this.props;

        courseActions.getCourse(this.courseId);
        authorsActions.getAuthors();
        categoriesActions.getCategories();
        languagesActions.getLanguages();
    }

    // getCurrentCourse() {
    //     if (this.props.editMode === EDIT_MODE_INSERT) {
    //         return null
    //     } else {
    //         return this.props.courses.find((elem) => {
    //             return elem.id === this.props.selected
    //         })
    //     }
    // }

    saveCourse(values) {
        this.props.coursesActions.saveCourse(values, this.props.editMode)
    }

    cancelEdit() {
        this.props.coursesActions.hideEditDialog();
    }

    selectLesson(id) {
        this.props.coursesActions.selectCourse(id);
    }

    render() {
        const {
            course,
            message,
            errorDlgShown,
        } = this.props;

        return (
            <div>
                <Webix ui={::this.getUI(::this.saveCourse, this.cancelEdit)} data={course}/>

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
            </div>
        )
    }

    getLanguagesArray(){
        return this.props.languages.map((elem) => {
            return {id: elem.id, value: elem.Name};
        })
    }

    getUI() {
        let _options = this.getLanguagesArray();

        return {
            view: "form", width: 0, elements: [
                {template: "#Cover#", data: {title: "Image One", src: "#Cover#"}},
                {view: "text", name: "Name", label: "Название курса", placeholder: "Введите название"},
                {view: "colorpicker", label: "Цвет курса", name: "Color", placeholder: 'Цвет курса',},
                {
                    view: "combo", name: "State", label: "Состояние", placeholder: "Выберите состояние",
                    options: [{id: 'D', value: 'Черновик'}, {id: 'Опубликованный'}, {id: 'A', value: 'Архив'}]
                },
                {view: "combo", name: "LanguageId", label: "Родительская категория", placeholder: "Введите категорию",
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
            view: "form", width : 0, elements: [{
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
        course: state.singleCourse.course,
        editMode: state.singleCourse.editMode,
        languages: state.languages.languages,

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