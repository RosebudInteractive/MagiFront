import React  from 'react';
import Webix from '../components/Webix';
import PropTypes from 'prop-types';

import * as singleEpisodeActions from "../actions/episode/episodeActions";
import * as singleLessonActions from "../actions/lessonActions";
import * as episodeTocActions from '../actions/episode/episodeTocActions';
import * as contentActions from '../actions/episode/episodeContentActions'
import { EpisodeToc, EpisodeContent} from '../components/episodeGrids'

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { EDIT_MODE_EDIT } from '../constants/Common';
import ObjectEditor, {labelWidth, } from './objectEditor';
import { Tabs, TabLink, TabContent } from 'react-tabs-redux';

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

    _getWebixForm() {
        let {
            tocActions,
            selectedToc,
            episodeToc,
            contentActions,
            content,
            selectedContent,
        } = this.props;

        let _data = this.getObject();
        return [
            <Webix ui={::this.getUI()} data={_data} key='webix1'/>,
            <Tabs className="tabs tabs-1" renderActiveTabContentOnly={true} key='tab1'>
                <div className="tab-links">
                    <TabLink to="tabToc">Оглавление эпизода</TabLink>
                    <TabLink to="tabContent">Компоненты</TabLink>
                </div>

                <div className="content">
                    <TabContent for="tabToc">
                        <EpisodeToc selectAction={tocActions.select}
                            // createAction={::this._createRecommendedReference}
                            // editAction={::this._editRecommendedReference}
                                    removeAction={tocActions.remove}
                                    moveUpAction={tocActions.moveUp}
                                    moveDownAction={tocActions.moveDown}
                                    editMode={this.editMode}
                                    selected={selectedToc}
                                    data={episodeToc}
                        />
                    </TabContent>
                    <TabContent for="tabContent">
                        <EpisodeContent selectAction={contentActions.select}
                            // createAction={::this._newSuppEpisode}
                            // editAction={::this._editEpisode}
                                        removeAction={contentActions.remove}
                                        moveUpAction={contentActions.moveUp}
                                        moveDownAction={contentActions.moveDown}
                                        editMode={this.editMode}
                                        selected={selectedContent}
                                        data={content}
                        />
                    </TabContent>
                </div>
            </Tabs>
        ]
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

        episodeToc: state.episodeToc.current,
        selectedToc: state.episodeToc.selected,

        content: state.episodeContent.current,
        selectedContent: state.episodeContent.selected,

        hasChanges : state.singleEpisode.hasChanges || state.episodeToc.hasChanges || state.episodeContent.hasChanges,

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
        tocActions : bindActionCreators(episodeTocActions, dispatch),
        contentActions: bindActionCreators(contentActions, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(EpisodeEditor);