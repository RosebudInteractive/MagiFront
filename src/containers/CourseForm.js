import React  from 'react'
import Webix from '../components/Webix';
import ErrorDialog from '../components/ErrorDialog';

import * as coursesActions from "../actions/CoursesActions";
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {EDIT_MODE_INSERT } from '../constants/Common';

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

    render() {
        const {
            selected,
            message,
            errorDlgShown,
        } = this.props;
        return (
            <div className="course-content">
                {'Форма курса #' + selected}
                <Webix ui={::this.getUI(::this.saveCourse, this.cancelEdit)} data={::this.getCurrentCourse()}/>
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

    // getCategoriesArray(){
    //     return this.props.categories.map((elem) => {
    //         return { id : elem.id, value : elem.Name };
    //     })
    // }

    getUI() {
        // let _options = this.getCategoriesArray();

        return {
            view: "form", width: 400, elements: [
                // {view: "text", name: "Name", label: "Наименование", placeholder: "Введите наименование"},
                // {view: "combo", name: "ParentId", label: "Родительская категория", placeholder: "Введите категорию",
                //     options : _options},
                // {
                //     cols: [
                //         {},
                //         {
                //             view: "button", value: "ОК", click: function(){
                //             if (save)
                //                 save(this.getFormView().getValues());
                //         }
                //         },
                //         {
                //             view: "button", value: "Отмена", click: function(){
                //             if (cancel)
                //                 cancel();
                //         }
                //         }
                //     ]
                // }
            ]
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