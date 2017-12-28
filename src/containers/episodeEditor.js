import React  from 'react';
// import {Prompt} from 'react-router-dom';
import Webix from '../components/Webix';
// import ErrorDialog from '../components/ErrorDialog';
import PropTypes from 'prop-types';

import * as singleEpisodeActions from "../actions/episodeActions";
import * as singleLessonActions from "../actions/lessonActions";

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
    // EDIT_MODE_INSERT,
    EDIT_MODE_EDIT
} from '../constants/Common';
import ObjectEditor, {labelWidth, } from './objectEditor';

class EpisodeEditor extends ObjectEditor {

    getObject() {
        return this.props.episode
    }

    getRootRout() {
        return '/courses/edit/' + this.props.courseId +
            '/lessons/edit/' + this.props.lessonId
    }

    _getEditRout() {
        return '/episodes/edit/';
    }

    get objectIdPropName() {
        return 'episodeId'
    }

    get objectName() {
        return 'episode'
    }

    get objectActions() {
        return this.props.episodeActions;
    }

    // constructor(props) {
    //     super(props);
    //
    //     const {
    //         episodeActions,
    //         episodeId,
    //         lessonId,
    //         lesson,
    //         isSupp
    //
    //     } = this.props;
    //
    //     if (episodeId > 0) {
    //         this.editMode = EDIT_MODE_EDIT;
    //         episodeActions.get(episodeId, lessonId);
    //     } else {
    //         this.editMode = EDIT_MODE_INSERT;
    //         let _number = lesson ? (isSupp ? lesson.suppEpisodes.length : lesson.mainEpisodes.length) : 0;
    //         _number++;
    //         episodeActions.create({Number: _number, EpisodeType:'L', Supp: isSupp});
    //     }
    // }

    _initEditMode(){
        this.editMode = EDIT_MODE_EDIT;
        this.objectActions.get(this.objectId, this.props.lessonId);
    }

    _getInitStateOfNewObject(props) {
        const {
            lesson,
            isSupp
        } = props;

        let _number = lesson ? (isSupp ? lesson.suppEpisodes.length : lesson.mainEpisodes.length) : 0;
        _number++;
        return {Number: _number, EpisodeType: 'L', Supp: isSupp};
    }

    // _initInsertMode() {
    //     this.editMode = EDIT_MODE_INSERT;
    // }

    // componentWillUnmount(){
    //     this.props.episodeActions.clear()
    // }

    _save(value) {
        let _obj = {
            id: value.id,
            LessonId: this.props.lessonId,
            Number: value.Number,
            Id: value.id,
            Name: value.Name,
            State: value.State,
            Audio: value.Audio,
            EpisodeType: value.EpisodeType,
            Transcript: value.Transcript,
            Supp: !!+value.Supp,
        };

        super._save(_obj)
    }

    _getWebixForm(){
        let _data = this.getObject();
        return <Webix ui={::this.getUI()} data={_data}/>
    }

    _getExtElements() {
        let that = this;

        return [
            {
                view: "text",
                name: "Name",
                label: "Название эпизода",
                placeholder: "Введите название эпизода",
                labelWidth: labelWidth,
                validate: window.webix.rules.isNotEmpty,
                invalidMessage: "Значение не может быть пустым",
                on: {
                    onChange: function () {
                        that._externalValidate(this);
                    },
                },
            },
            {
                view: "text",
                name: "Number",
                label: "Номер эпизода",
                readonly: true,
                disabled: true,
                labelWidth: labelWidth,
            },
            {
                view: "combo",
                name: "EpisodeType",
                label: "Тип эпизода",
                placeholder: "Выберите тип эпизода",
                options: [{id: 'L', value: 'Лекция'}],
                labelWidth: labelWidth,
            },
            {
                view: "text",
                name: "Audio",
                label: "Аудио-контент",
                placeholder: "",
                labelWidth: labelWidth,
                validate: window.webix.rules.isNotEmpty,
                invalidMessage: "Значение не может быть пустым",
                on: {
                    onChange: function () {
                        that._externalValidate(this);
                    },
                },
            },
            {
                view: "checkbox",
                name: "Supp",
                label: "Дополнительный материал",
                readonly: true,
                disabled: true,
                labelWidth: labelWidth,
            },
            {
                view: "combo",
                name: "State",
                label: "Состояние",
                placeholder: "Выберите состояние",
                options: [
                    {id: 'D', value: 'Черновик'},
                    {id: 'R', value: 'Готовый'},
                    {id: 'A', value: 'Архив'}
                    ],
                labelWidth: labelWidth,
            },
            {
                view: "richtext",
                label: "Транскрипт",
                height: 300,
                width: 500,
                name: "Transcript",
                labelWidth: labelWidth,
            }
        ];
    }
}

EpisodeEditor.propTypes = {
    isSupp : PropTypes.bool
};

function mapStateToProps(state, ownProps) {
    return {
        episode: state.singleEpisode.current,
        lesson: state.singleLesson.current,
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