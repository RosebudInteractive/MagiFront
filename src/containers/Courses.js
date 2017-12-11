import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as coursesActions from "../actions/CoursesActions";
import * as commonDlgActions from '../actions/CommonDlgActions';

import Webix from '../components/Webix';
import YesNoDialog from "../components/YesNoDialog";
import ErrorDialog from '../components/ErrorDialog';
import { EDIT_MODE_EDIT, EDIT_MODE_INSERT } from "../constants/Common";

class Coureses extends React.Component {
    componentDidMount(){
        this.props.coursesActions.getCourses();
    }

    onAddBtnClick() {
        this.props.history.push('/courses/new');
        this.props.coursesActions.showEditDialog(EDIT_MODE_INSERT)
    }

    onEditBtnClick() {
        this.props.history.push('/courses/edit/' + this.props.selected);
        this.props.coursesActions.showEditDialog(EDIT_MODE_EDIT)
    }

    deleteCourse() {
        this.props.coursesActions.deleteCourse(this.props.selected)
    }

    confirmDeleteCourse() {
        this.props.commonDlgActions.showDeleteConfirmation(this.props.selected)
    }

    cancelDelete() {
        this.props.categoriesActions.cancelDelete()
    }

    select(id) {
        this.props.coursesActions.selectCourse(id);
    }

    render() {
        const {
            courses,
            fetching,
            hasError,
            message,
            selected,
            deleteDlgShown,
            errorDlgShown,
        } = this.props;

        return <div className="courses">
            {
                fetching ?
                    <p>Загрузка...</p>
                    :
                    hasError ?
                        <p>{message}</p>
                        :
                        <div className="courses-content">
                            <div className="action-bar">
                                <button className='btn'
                                        onClick={::this.onAddBtnClick}
                                >Добавить...</button>{' '}
                                <button
                                    className={'btn' + (selected === null ? " disabled" : "")}
                                    onClick={::this.onEditBtnClick}
                                    disabled={(selected === null)}
                                >Исправить...</button>{' '}
                                <button
                                    className={'btn' + (selected === null ? " disabled" : "")}
                                    onClick={::this.confirmDeleteCourse}
                                    disabled={(selected === null)}
                                >Удалить...</button>
                            </div>
                            <div className="grid-container">
                                <Webix ui={::this.getUI(::this.select)} data={courses} />
                            </div>
                        </div>
            }
            {
                deleteDlgShown ?
                    <YesNoDialog
                        yesAction={::this.deleteCourse}
                        noAction={::this.cancelDelete}
                        message="Удалить курс?"
                        data={selected}
                    />
                    :
                    ""
            }
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
    }

    getUI(select) {
        // function getColorStyle(value) {
        //     return {color : value}
        // }

        return {
            view: "datatable",
            scroll: false,
            autoheight: true,
            select: true,
            editable: false,
            columns: [
                // {id: 'Cover', header: 'Обложка', width:150, template : "<img src='#Cover#'/>"},
                {id: 'Name', header: 'Название', width: 200},
                {id: 'ColorHex', header: 'Цвет курса', width: 80, template : "<span style = 'background-color : #ColorHex#; border-radius: 4px; '>#ColorHex#</span>"}, //cssFormat: getColorStyle},
                {id: 'URL', header: 'Ярлык URL', width : 150, template:"<a href='#URL#'>#URL#</a>"},
                {id: 'State', header: 'Состояние', width: 150, editor: 'select',
                    options: [{id: 'D', value: 'Черновик'}, {id: 'P', value: 'Опубликованный'}, {id: 'A', value: 'Архив'}]},
                {id: 'LanguageName', header : 'Язык курса', width: 200},
                {id: "Description", header: "Описание курса", fillspace: true},
            ],
            on: {
                onAfterSelect: function (selObj) {
                    select(selObj.id);
                },
                onBeforeAdd: function(id, data) {
                    if (data.values[0].value === "")
                        data.values[0].value = "Select something";
                }
            }
        };
    }
}

function mapStateToProps(state) {
    return {
        courses: state.courses.courses,
        selected: state.courses.selected,
        editDlgShown: state.courses.editDlgShown,
        editMode: state.courses.editMode,

        hasError: state.commonDlg.hasError,
        message: state.commonDlg.message,
        deleteDlgShown: state.commonDlg.deleteDlgShown,
        errorDlgShown: state.commonDlg.errorDlgShown,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        coursesActions: bindActionCreators(coursesActions, dispatch),
        commonDlgActions : bindActionCreators(commonDlgActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Coureses);