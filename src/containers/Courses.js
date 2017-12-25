import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as coursesActions from "../actions/coursesListActions";
import * as commonDlgActions from '../actions/CommonDlgActions';

import Webix from '../components/Webix';
import YesNoDialog from "../components/YesNoDialog";
import ErrorDialog from '../components/ErrorDialog';

class Coureses extends React.Component {
    componentDidMount(){
        this.props.coursesActions.getCourses();
        this._selected = null;
    }

    onAddBtnClick() {
        this.props.history.push('/courses/new');
    }

    onEditBtnClick() {
        this.props.history.push('/courses/edit/' + this.props.selected);
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
        this._selected = selected;

        return <div className="courses">
            {
                fetching ?
                    <p>Загрузка...</p>
                    :
                    hasError ?
                        <p>{message}</p>
                        :
                        <div className="courses-content">
                            <div className="action-bar" style={{marginTop: 5, marginBottom: -10, marginLeft: 2}}>
                                <button className='btn-new'
                                        onClick={::this.onAddBtnClick}
                                />{' '}
                                <button
                                    className={'btn-edit' + (selected === null ? " disabled" : "")}
                                    onClick={::this.onEditBtnClick}
                                    disabled={(selected === null)}
                                />{' '}
                                <button
                                    className={'btn-delete' + (selected === null ? " disabled" : "")}
                                    onClick={::this.confirmDeleteCourse}
                                    disabled={(selected === null)}
                                />
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

    getUI() {
        let that = this;

        return {
            view: "datatable",
            scroll: false,
            autoheight: true,
            select: true,
            editable: false,
            columns: [
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
                    if (selObj.id !== that._selected)
                        that._selected = null;
                    that.select(selObj.id);
                },
                onAfterRender: function() {
                    if ((that._selected) && this.getItem(that._selected)) {
                        this.select(that._selected)
                    }
                }
            }
        };
    }
}

function mapStateToProps(state) {
    return {
        courses: state.courses.items,
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