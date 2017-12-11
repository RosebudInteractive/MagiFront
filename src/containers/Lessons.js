import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as coursesActions from "../actions/CoursesActions";
import * as commonDlgActions from '../actions/CommonDlgActions';

import Webix from '../components/Webix';
import YesNoDialog from "../components/YesNoDialog";
import ErrorDialog from '../components/ErrorDialog';
// import { EDIT_MODE_EDIT, EDIT_MODE_INSERT } from "../constants/Common";

class Lessons extends React.Component {
    componentDidMount(){
        // this.props.coursesActions.getCourses();
    }

    onAddBtnClick() {
        // this.props.history.push('/courses/new');
        // this.props.coursesActions.showEditDialog(EDIT_MODE_INSERT)
    }

    onEditBtnClick() {
        // this.props.history.push('/courses/edit/' + this.props.selected);
        // this.props.coursesActions.showEditDialog(EDIT_MODE_EDIT)
    }

    deleteLesson() {
        // this.props.coursesActions.deleteCourse(this.props.selected)
    }

    confirmDeleteLesson() {
        // this.props.commonDlgActions.showDeleteConfirmation(this.props.selected)
    }

    cancelDelete() {
        this.props.categoriesActions.cancelDelete()
    }

    select(id) {
        this.props.coursesActions.selectLesson(id);
    }

    render() {
        const {
            lessons,
            fetching,
            hasError,
            message,
            selected,
            deleteDlgShown,
            errorDlgShown,
        } = this.props;

        return <div className="lessons">
            Лекции курса
            {
                fetching ?
                    <p>Загрузка...</p>
                    :
                    hasError ?
                        <p>{message}</p>
                        :
                        <div className="lessons-content">
                            <div className="action-bar">
                                <button className='btn'
                                        onClick={::this.onAddBtnClick}
                                >Создать...</button>{' '}
                                <button
                                    className={'btn' + (selected === null ? " disabled" : "")}
                                    onClick={::this.onEditBtnClick}
                                    disabled={(selected === null)}
                                >Добавить...</button>{' '}
                                <button
                                    className={'btn' + (selected === null ? " disabled" : "")}
                                    onClick={::this.confirmDeleteLesson}
                                    disabled={(selected === null)}
                                >Исправить...</button>
                            </div>
                            <div className="grid-container">
                                <Webix ui={::this.getUI(::this.select)} data={lessons} />
                            </div>
                        </div>
            }
            {
                deleteDlgShown ?
                    <YesNoDialog
                        yesAction={::this.deleteCourse}
                        noAction={::this.cancelDelete}
                        message="Удалить лекцию?"
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

    getUI() {
        return {
            view: "datatable",
            scroll: false,
            autoheight: true,
            // autowidth: true,
            select: true,
            editable: false,
            width: 600,
            columns: [
                {id: 'Number', header: 'Номер', width: 75},
                {id: 'Name', header: 'Название', fillspace: true},
                // {id: 'Color', header: 'Цвет курса', width: 50, cssFormat: getColorStyle},
                {id: 'State', header: 'Состояние', width: 120},
                {id: 'LanguageName', header: 'Язык курса', width: 120},
                {id: 'ReadyDate', header: 'Дата готовности', width: 150, format: this.formatDate, },
                // {id: "ShortDescription", header: "Описание курса", fillspace: true},
            ],
            on: {
                onAfterSelect: (selObj) => {
                    this.selectLesson(selObj.id);
                }
            }
        }
    }

    formatDate(data) {
        let fn = window.webix.Date.dateToStr("%d.%m.%Y %H:%i", true);
        return fn(new Date(data));
    }
}

function mapStateToProps(state) {
    return {
        lessons: state.singleCourse.lessons,
        // selected: state.courses.selected,
        // editDlgShown: state.courses.editDlgShown,
        // editMode: state.courses.editMode,

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

export default connect(mapStateToProps, mapDispatchToProps)(Lessons);