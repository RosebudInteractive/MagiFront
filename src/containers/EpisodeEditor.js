import React  from 'react';
import {Prompt} from 'react-router-dom';
import Webix from '../components/Webix';
import ErrorDialog from '../components/ErrorDialog';
import PropTypes from 'prop-types';

import * as singleEpisodeActions from "../actions/SingleEpisodeActions";
import * as singleLessonActions from "../actions/SingleLessonActions";

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
    EDIT_MODE_INSERT,
    EDIT_MODE_EDIT
} from '../constants/Common';

class EpisodeEditor extends React.Component {

    constructor(props) {
        super(props);

        const {
            episodeActions,
            episodeId,
            lessonId,
            lesson,
            isSupp

        } = this.props;

        if (episodeId > 0) {
            this.editMode = EDIT_MODE_EDIT;
            episodeActions.get(episodeId, lessonId);
        } else {
            this.editMode = EDIT_MODE_INSERT;
            let _number = lesson ? (isSupp ? lesson.suppEpisodes.length : lesson.mainEpisodes.length) : 0;
            _number++;
            episodeActions.create({Number: _number, EpisodeType:'L', Supp: isSupp});
        }
    }

    componentWillUnmount(){
        this.props.episodeActions.clear()
    }

    saveEpisode(value) {
        let {
            episodeActions,
            lessonId
        } = this.props;

        let _obj = {
            id: value.id,
            LessonId: lessonId,
            Number: value.Number,
            Id: value.id,
            Name: value.Name,
            State: value.State,
            Audio: value.Audio,
            EpisodeType: value.EpisodeType,
            Transcript: value.Transcript,
            Supp: !!+value.Supp,
        };

        episodeActions.save(_obj, this.editMode)
    }

    _changeData(data) {
        this.props.episodeActions.changeData(data)
    }
    _cancelChanges() {
        this._needRevalidate = true;
        this.props.episodeActions.cancelCanges();
    }

    // selectLesson(id) {
    //     // this.props.coursesActions.selectCourse(id);
    // }

    _goBack() {
        this.props.history.goBack()
    }

    _getHasChanges() {
        return this.props.hasChanges;
    }

    render() {
        let _isEditMode = this.editMode === EDIT_MODE_EDIT;

        const {
            episode,
            message,
            errorDlgShown,
            fetching,
            hasChanges
        } = this.props;

        return (
            fetching ?
                <p>Загрузка...</p>
                :
                <div>
                    <Prompt when={hasChanges} message='Есть несохраненные данные. Уйти?'/>
                    <Webix ui={
                        ::this.getUI(::this.saveEpisode,
                            ::this._cancelChanges,
                            ::this._changeData,
                            ::this._getHasChanges,
                            _isEditMode)}
                           data={episode}
                    />
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

    _getCourseAuthorsArray(){
        return this.props.authors.map((elem) => {
            return {id: elem.id, value: elem.FirstName + ' ' + elem.LastName};
        })
    }

    getUI(saveAction, cancel, changeData, hasChanges) {
        let that = this;

        return {
            view: "form",
            width: 700,
            id: 'mainData',
            elements: [
                {
                    view: "button", name: 'btnOk', value: '<<< Назад',//css:'btn-back',
                    click: () => {
                        this._goBack();
                    }
                },
                {
                    view: "text",
                    name: "Name",
                    label: "Название эпизода",
                    placeholder: "Введите название эпизода",
                    labelWidth: 120,
                    invalidMessage: "Значение не может быть пустым",
                },
                {view: "text", name: "Number", label: "Номер эпизода", readonly: true, labelWidth: 120,},
                {
                    view: "combo",
                    name: "EpisodeType",
                    label: "Тип эпизода", placeholder: "Выберите тип эпизода",
                    options: [{id: 'L', value: 'Лекция'}],
                    labelWidth: 120,
                },
                {
                    view: "text",
                    name: "Audio",
                    label: "Аудио-контент",
                    placeholder: "", labelWidth: 120,
                    invalidMessage: "Значение не может быть пустым",
                },
                {view: "checkbox", name: "Supp", label: "Дополнительный материал", readonly: true, labelWidth: 120,},
                {
                    view: "combo", name: "State", label: "Состояние", placeholder: "Выберите состояние",
                    options: [{id: 'D', value: 'Черновик'}, {id: 'R', value: 'Готовый'}, {id: 'A', value: 'Архив'}],
                    labelWidth: 120,
                },
                {
                    view: "richtext",
                    label: "Транскрипт",
                    height: 100,
                    width: 500,
                    name: "Transcript",
                },
                {
                    cols: [
                        {},
                        {},
                        {
                            view: "button", name: 'btnOk', value: "ОК",
                            click: function () {
                                if ((saveAction) && this.getFormView().validate()) {
                                    saveAction(this.getFormView().getValues());
                                }
                            }
                        },
                        {
                            view: "button", name: 'btnCancel', value: "Отмена",
                            click: function () {
                                if (cancel)
                                    cancel();
                            }
                        }
                    ]
                }
            ],
            rules: {
                Name: window.webix.rules.isNotEmpty,
                EpisodeType: window.webix.rules.isNotEmpty,
                Audio: window.webix.rules.isNotEmpty,
            },
            on: {
                onChange: function () {
                    this.validate();
                    changeData(::this.getValues());
                },
                onValues: function () {
                    if (hasChanges()) {
                        this.elements.btnOk.enable();
                        this.elements.btnCancel.enable()
                    } else {
                        this.elements.btnOk.disable();
                        this.elements.btnCancel.disable()
                    }

                    if (that._needRevalidate) {
                        this.validate();
                        that._needRevalidate = false;
                    }
                },
            }
        };
    }
}

EpisodeEditor.propTypes = {
    isSupp : PropTypes.bool
};

function mapStateToProps(state, ownProps) {
    return {
        episode: state.singleEpisode.episode,
        lesson: state.singleLesson.lesson,
        // course: state.singleCourse.course,
        hasChanges : state.singleEpisode.hasChanges,

        hasError: state.commonDlg.hasError,
        message: state.commonDlg.message,
        errorDlgShown: state.commonDlg.errorDlgShown,

        episodeId: parseInt(ownProps.match.params.id),
        lessonId: parseInt(ownProps.match.params.lessonId),
        courseId: parseInt(ownProps.match.params.courseId),
        fetching: state.singleLesson.fetching || state.singleEpisode.fetching, // || state.singleCourse.fetching
    }
}

function mapDispatchToProps(dispatch) {
    return {
        episodeActions: bindActionCreators(singleEpisodeActions, dispatch),
        lessonActions: bindActionCreators(singleLessonActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(EpisodeEditor);