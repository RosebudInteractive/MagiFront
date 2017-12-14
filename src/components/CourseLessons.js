import React, { Component } from 'react';
import Webix from '../components/Webix';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as courseActions from '../actions/SingleCourseActions';

class CourseLessons extends Component {
    constructor(props) {
        super(props);

        this.selectedLesson = null;
    }

    addClicked() {
        // this.props.addAuthorAction();
    }

    removeLessonFormCourse(id) {
        this.props.courseActions.removeLesson(id)
    }

    moveUp(){
        if (this.selectedLesson) {
            this.props.courseActions.moveLessonUp(this.selectedLesson)
        }
    }

    moveDown() {
        if (this.selectedLesson) {
            this.props.courseActions.moveLessonDown(this.selectedLesson)
        }
    }

    selectLesson(id) {
        if (this.selectedLesson !== id) {
            this.selectedLesson = id;
            this.render();
        }
    }

    editLesson() {
        if (this.selectedLesson) {
            this.props.editAction(this.selectedLesson);
        }
    }

    _create() {
        this.props.createAction();
    }

    _hasSelected() {
        return this.selectedLesson !== null
    }

    render () {
        const {data} = this.props;
        return <div>
            Лекции курса
            <div className="dlg-btn-bar">
                <button className="btn-new" onClick={::this._create}/>{' '}
                {/*<button className="btn yes" onClick={::this.addClicked}>Добавить...</button>{' '}*/}
                <button className='btn-edit' onClick={::this.editLesson}/>{' '}
                <button className="btn-up" onClick={::this.moveUp}/>{' '}
                <button className="btn-down" onClick={::this.moveDown}/>{' '}
            </div>
            <Webix ui={::this.getUI(::this.selectLesson)} data={data}/>
        </div>
    }

    getUI(select) {
        return {
            view: "datatable",
            scroll: false,
            autoheight: true,
            select: true,
            width: 700,
            editable: false,
            columns: [
                {id: 'Number', header: '#', width: 30},
                {id: 'Name', header: 'Название', fillspace: true},
                {id: 'State', header: 'Состояние', width: 90, editor: 'select',
                    options: [{id: 'D', value: 'Черновик'}, {id: 'R', value: 'Готовый'}, {id: 'A', value: 'Архив'}]},
                {id: 'LanguageName', header: 'Язык курса', width: 90},
                {id: 'ReadyDate', header: 'Дата готовности', width: 120, format: this.formatDate, },
                {
                    id: "",
                    template: "<input class='delbtn' type='button'>",
                    // css:"padding_less",
                    width: 50
                },
            ],

            on: {
                onAfterSelect: function (selObj) {
                    select(selObj.id);
                }
            },

            onClick: {
                delbtn: (e, id) => {
                    //will be called on button click
                    this.removeLessonFormCourse(id.row);
                }
            }
        };
    }

    formatDate(data) {
        let fn = window.webix.Date.dateToStr("%d.%m.%Y %H:%i", true);
        return fn(new Date(data));
    }
}

CourseLessons.propTypes = {
    // message: PropTypes.string.isRequired,
    createAction: PropTypes.func.isRequired,
    editAction: PropTypes.func.isRequired,
    // noAction: PropTypes.func.isRequired,
    data: PropTypes.any
};


function mapStateToProps(state, ownProps) {
    return {
        languages: state.languages.languages,

        hasError: state.commonDlg.hasError,
        message: state.commonDlg.message,
        errorDlgShown: state.commonDlg.errorDlgShown,

        // fetching: state.authors.fetching || state.categories.fetching || state.languages.fetching || state.singleCourse.fetching
        ownProps,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        courseActions : bindActionCreators(courseActions, dispatch),
    }
}
//
export default connect(mapStateToProps, mapDispatchToProps)(CourseLessons);
