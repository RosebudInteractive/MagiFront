import React  from 'react'
import Webix from '../components/Webix';
import ErrorDialog from '../components/ErrorDialog';

import * as coursesActions from "../actions/CoursesActions";
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {EDIT_MODE_INSERT } from '../constants/Common';
import Lessons from './Lessons';

class CourseForm extends React.Component {

    getCurrentCourse() {
        if (this.props.editMode === EDIT_MODE_INSERT) {
            return null
        } else {
            return this.props.courses.find((elem) => {
                return elem.id === this.props.selected
            })
        }
    }

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
            selected,
            message,
            errorDlgShown,
        } = this.props;

        return (
            <div>
                <Webix ui={::this.getUI(::this.saveCourse, this.cancelEdit)} data={this.getCurrentCourse()}/>
                <Lessons/>
                <Webix ui={::this.getButtons()} />
                {
                    errorDlgShown ?
                        <ErrorDialog
                            message={message}
                            data={selected}
                        />
                        :
                        ""
                }
            </div>
        )
    }

    getUI() {
        // let _options = this.getCategoriesArray();

        return {
            view: "form", width : 0, elements: [
                {view: "text", name: "Name", label: "Название курса", placeholder: "Введите название"},
                {view: "colorpicker", label: "Цвет курса", name: "Color", placeholder: 'Цвет курса',},
                // {view: "textarea", name: "Description", label: "Описание", placeholder: "Описание", height: 150,},
                {
                    view: "combo", name: "State", label: "Состояние", placeholder: "Выберите состояние",
                    options: [{id: 'D', value: 'Черновик'}, {id: 'Опубликованный'}, {id: 'A', value: 'Архив'}]
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
        courses: state.courses.courses,
        editMode: state.courses.editMode,

        hasError: state.commonDlg.hasError,
        message: state.commonDlg.message,
        errorDlgShown: state.commonDlg.errorDlgShown,

        selected: Number(ownProps.match.params.id),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        coursesActions: bindActionCreators(coursesActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CourseForm);