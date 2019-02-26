import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import * as coursesActions from "../actions/coursesListActions";
import * as commonDlgActions from '../actions/CommonDlgActions';

import Webix from '../components/Webix';
import YesNoDialog from "../components/dialog/yes-no-dialog";
import ErrorDialog from '../components/dialog/error-dialog';
import $ from "jquery";

class Coureses extends React.Component {
    constructor(props) {
        super(props)

        this._resizeHandler = () => {
            // let _height = $(window).height() - $('.top-bar-size').innerHeight() + $('.action-bar').innerHeight()
            //     _widht = $('.grid-container').innerWidth();
            //
            // $('.webix-grid-wrapper').innerHeight(_height);

            // if (window.$$('courses-grid')) {
            //     window.$$('courses-grid').$setSize(_widht, _height)
            // }
        }
    }


    componentWillMount() {
        this.props.coursesActions.getCourses();
        this._selected = null;
    }

    componentDidMount() {
        $(window).on('resize', this._resizeHandler);
        this._resizeHandler();
    }

    componentWillUnmount() {
        $(window).unbind('resize', this._resizeHandler)
    }

    onAddBtnClick() {
        this.props.history.push('/adm/courses/new');
    }

    onEditBtnClick() {
        this.props.history.push('/adm/courses/edit/' + this.props.selected);
    }

    deleteCourse() {
        this.props.coursesActions.deleteCourse(this.props.selected)
    }

    confirmDeleteCourse() {
        this.props.commonDlgActions.showDeleteConfirmation(this.props.selected)
    }

    cancelDelete() {
        this.props.coursesActions.cancelDelete()
    }

    select(id) {
        this.props.coursesActions.selectCourse(id);
    }

    shouldComponentUpdate(nextProps,) {
        return !(this.props.selected && (this.props.selected !== nextProps.selected));
    }

    render() {
        const {
            courses,
            fetching,
            loaded,
            hasError,
            message,
            selected,
            deleteDlgShown,
            errorDlgShown,
        } = this.props;
        this._selected = selected;

        return <div className="courses">

            <div className="courses-content">
                <div className="action-bar">
                    <button className='tool-btn new'
                            onClick={::this.onAddBtnClick}
                    />
                    {' '}
                    <button
                        className={'tool-btn edit' + (selected === null ? " disabled" : "")}
                        onClick={::this.onEditBtnClick}
                        disabled={(selected === null)}
                    />
                    {' '}
                    <button
                        className={'tool-btn delete' + (selected === null ? " disabled" : "")}
                        onClick={::this.confirmDeleteCourse}
                        disabled={(selected === null)}
                    />
                </div>
                {
                    fetching ?
                        <p>Загрузка...</p>
                        :
                        hasError ?
                            <p>{message}</p>
                            :
                            loaded ?
                                <div className="grid-container">
                                    <div className="webix-grid-wrapper">
                                        <Webix ui={::this.getUI(::this.select)} data={courses}/>
                                    </div>
                                </div>
                                : null
                }
            </div>

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
            id: 'courses-grid',
            scroll: false,
            autoheight: true,
            select: true,
            editable: false,
            columns: [
                {id: 'Name', header: 'Название', width: 230},
                {
                    id: 'URL',
                    header: 'Ярлык URL',
                    width: 150,
                    template: (obj) => {
                        return obj.URL ? "<a href='" + obj.URL + "'>" + obj.URL + "</a>" : ''
                    },
                },
                {
                    id: 'State', header: 'Состояние', width: 150, editor: 'select',
                    options: [{id: 'D', value: 'Черновик'}, {id: 'P', value: 'Опубликованный'}, {
                        id: 'A',
                        value: 'Архив'
                    }]
                },
                {id: 'LanguageName', header: 'Язык курса', width: 200},
                {id: "Description", header: "Описание курса", fillspace: true},
            ],
            on: {
                onAfterSelect: function (selObj) {
                    if (selObj.id !== that._selected)
                        that._selected = null;
                    that.select(selObj.id);
                },
                onAfterRender: function () {
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
        fetching: state.courses.fetching,
        loaded: state.courses.loaded,
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
        commonDlgActions: bindActionCreators(commonDlgActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Coureses);