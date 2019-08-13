import React from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import * as coursesActions from "../../actions/coursesListActions";
import {deleteCourse} from "../../actions/coursesListActions";
import * as commonDlgActions from '../../actions/CommonDlgActions';

import Webix from '../../components/Webix';
import YesNoDialog from "../../components/dialog/yes-no-dialog";
import ErrorDialog from '../../components/dialog/error-dialog';
import $ from "jquery";
import LoadingPage from "../../components/common/loading-page";

class Courses extends React.Component {
    constructor(props) {
        super(props)

        this._resizeHandler = () => {
            const _main = $('.main-area'),
                _height = _main.height(),
                _width = _main.width()

            if (window.$$('courses-grid')) {
                const _headerHeight = window.$$('courses-grid').config.headerRowHeight

                window.$$('courses-grid').$setSize(_width, _height - _headerHeight)
            }
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
        this.props.history.push('/adm/courses/edit/' + this._selected);
    }

    deleteCourse() {
        let _index = this.props.courses.findIndex((item) => {
            return item.id === this._selected
        })

        this.props.deleteCourse(this._selected)
            .then(({courses}) => {
                this._selected =
                    ((courses.length > 0) && (_index > -1))
                        ?
                        (_index < courses.length)
                            ?
                            courses[_index].id
                            :
                            courses[courses.length - 1].id
                        :
                        null;

                this.forceUpdate();
            })
            .catch(() => {
            })
    }

    confirmDeleteCourse() {
        this.props.commonDlgActions.showDeleteConfirmation(this._selected)
    }

    cancelDelete() {
        this.props.coursesActions.cancelDelete()
    }

    select(id) {
        this._selected = +id;
    }

    componentWillReceiveProps(nextProps,) {
        if (!this.props.loaded && nextProps.loaded) {
            this._selected = (nextProps.courses.length > 0) ? nextProps.courses[0].id : null;
        }
    }

    componentDidUpdate(prevProps,) {
        if (!prevProps.loaded && this.props.loaded) {
            this._resizeHandler()
        }
    }

    render() {
        const {
            courses,
            fetching,
            loaded,
            message,
            deleteDlgShown,
            errorDlgShown,
        } = this.props;

        return <div className="courses">

            <div className="courses-content">
                <div className="action-bar">
                    <button className='tool-btn new'
                            onClick={::this.onAddBtnClick}
                    />
                    {' '}
                    <button
                        className={'tool-btn edit' + (this._selected === null ? " disabled" : "")}
                        onClick={::this.onEditBtnClick}
                        disabled={(this._selected === null)}
                    />
                    {' '}
                    <button
                        className={'tool-btn delete' + (this._selected === null ? " disabled" : "")}
                        onClick={::this.confirmDeleteCourse}
                        disabled={(this._selected === null)}
                    />
                </div>
                {
                    fetching ?
                        <LoadingPage/>
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
                        message={"Удалить курс" + this._getSelectedCourseName() + "?"}
                    />
                    :
                    ""
            }
            {
                errorDlgShown ?
                    <ErrorDialog
                        message={message}
                    />
                    :
                    ""
            }
        </div>
    }

    _getSelectedCourseName() {
        let _course = null;

        if (this._selected) {
            _course = this.props.courses.find((item) => {
                return item.id === this._selected
            })
        }

        return _course ? ' "' + _course.Name + '"' : ''
    }

    getUI() {
        let that = this;

        return {
            view: "datatable",
            id: 'courses-grid',
            scroll: 'y',
            height: 500,
            select: true,
            editable: false,
            columns: [
                {id: 'Name', header: ['Название', {content:"textFilter"}], width: 350},
                {
                    id: 'State', header: ['Состояние', {content:"selectFilter"}], width: 150, editor: 'select',
                    options: [{id: 'D', value: 'Черновик'}, {id: 'P', value: 'Опубликованный'}, {
                        id: 'A',
                        value: 'Архив'
                    }]
                },
                {id: 'LanguageName', header: ['Язык курса', {content:"selectFilter"}], width: 200},
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
        deleteCourse: bindActionCreators(deleteCourse, dispatch),
        commonDlgActions: bindActionCreators(commonDlgActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Courses);