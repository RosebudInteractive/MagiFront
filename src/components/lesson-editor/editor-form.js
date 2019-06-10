import React from 'react'
import {connect} from "react-redux";
import PropTypes from "prop-types";
import {bindActionCreators} from 'redux';
import MainTab from './tabs/main-tab'
import SubscriptionTab from './tabs/subscription-tab'
import SocialNetworkTab from './tabs/social-network-tab'
import EpisodesTab from './tabs/episodes-tab'
import ReferencesTab from './tabs/references-tab'
import ResourcesTab from './tabs/resources-tab'
import BottomControls from "../bottom-contols/buttons";
import {
    reduxForm,
    reset,
    isDirty,
    getFormValues,
    isValid
} from 'redux-form'
import {Prompt} from "react-router-dom";
import {showErrorDialog} from "../../actions/app-actions";
import history from '../../history'
import {fixedLessonIdSelector, fixedObjDescrSelector} from "adm-ducks/params";
import {cancelChanges, setExtLinks, save} from "../../actions/lesson/lesson-actions";
import {checkExtLinks, getExtLinks} from "../../tools/link-tools";
import {setFixedLesson,} from "adm-ducks/params";
import {EDIT_MODE_EDIT, EDIT_MODE_INSERT} from "../../constants/Common";
import {setActiveTab, activeTabsSelector} from "adm-ducks/app";
import SavingBlock from "../common/saving-page";

const TABS = {
    MAIN: 'main',
    SUBSCRIPTION: 'SUBSCRIPTION',
    SOCIAL_NETWORKS: 'social_networks',
    EPISODES_AND_SUBS: 'episodes_and_subs',
    REFERENCES: 'references',
    RESOURCES: 'resources',
}

const NEW_LESSON = {
    Name: '',
    Description: null,
    CourseId: null,
    Cover: null,
    CoverMeta: null,
    extLinksValues: null,
    AuthorId: null,
    State: 'D',
    IsAuthRequired: true,
    ShortDescription: " ",
}

class LessonEditorForm extends React.Component {

    static propTypes = {
        isSublesson : PropTypes.bool,
    }

    constructor(props) {
        super(props)

        this.state = {
            currentTab: TABS.MAIN,
        }
    }

    componentWillMount() {
        this._init()
    }

    componentDidMount() {
        let _activeTab = this.props.activeTabs.get(this.props.isSublesson ? 'SublessonEditor' : 'LessonEditor')
        if (_activeTab) {
            this.setState({
                currentTab: _activeTab,
            })
        }
    }

    componentWillUnmount() {
        this.props.setActiveTab({page: this.props.isSublesson ? 'SublessonEditor' : 'LessonEditor', value: this.state.currentTab})
    }

    _init() {
        let {lesson, fixedLessonId, fixDescription, isSublesson,} = this.props,
            _lesson = lesson ? lesson : this._getNewLesson(),
            _fixed = (lesson && (lesson.id) && (lesson.id === fixedLessonId)),
            _fixDescription = _fixed ? fixDescription : ''

        if (_lesson) {
            this.props.initialize({
                courseId: _lesson.CourseId,
                courseName: _lesson.CourseName,
                currParentName: _lesson.CurrParentName,
                name: _lesson.Name,
                number: _lesson.Number,
                lessonType: _lesson.LessonType,
                URL: _lesson.URL,
                authorId: _lesson.AuthorId,
                cover: {
                    file: _lesson.Cover,
                    meta: _lesson.CoverMeta,
                },
                state: _lesson.State,
                readyDate: _lesson.DT_ReadyDate,
                description: _lesson.ShortDescription,
                extLinksValues: _lesson.extLinksValues,
                snName: _lesson.SnName,
                snDescription: _lesson.SnDescription,
                snPost: _lesson.SnPost,
                ogImageResourceId: this.props.ogImageResourceId,
                twitterImageResourceId : this.props.twitterImageResourceId,
                isAuthRequired: _lesson.IsAuthRequired ? _lesson.IsAuthRequired : false,
                isSubsRequired: _lesson.IsSubsRequired ? _lesson.IsSubsRequired : false,
                freeExpDate: _lesson.FreeExpDate,
                isFreeInPaidCourse: _lesson.IsFreeInPaidCourse,
                fixed: _fixed,
                fixDescription: _fixDescription,
                subLessons: !isSublesson ? (_lesson.Childs ? _lesson.Childs : []) : [],
                resources: _lesson.Resources ? _lesson.Resources : [],
                commonRef: _lesson.commonRef ? _lesson.commonRef : [],
                recommendedRef: _lesson.recommendedRef ? _lesson.recommendedRef : []
            });
        }
    }

    _getNewLesson() {
        let _lesson = Object.assign({}, NEW_LESSON)

        if (this.props.course) {
            _lesson.CourseId = this.props.course.id
            _lesson.CourseName = this.props.course.Name
            _lesson.Number = this.props.course.Lessons ? (this.props.course.Lessons.length + 1) : 1
            _lesson.LessonType = 'L'
        }

        return _lesson
    }


    render() {
        const {hasChanges, saving,} = this.props;

        return <React.Fragment>
            <SavingBlock visible={saving}/>
            <Prompt when={hasChanges}
                    message={'Есть несохраненные данные.\n Перейти без сохранения?'}/>
            <div className='editor__head'>
                <div className="tabs tabs-1" key='tab1'>
                    <div className="tab-links">
                        <div
                            className={"tabs-1 tab-link" + (this.state.currentTab === TABS.MAIN ? ' tab-link-active' : '')}
                            onClick={() => {this._switchTo(TABS.MAIN)}}>Основные
                        </div>
                        <div
                            className={"tabs-1 tab-link" + (this.state.currentTab === TABS.SUBSCRIPTION ? ' tab-link-active' : '')}
                            onClick={() => {this._switchTo(TABS.SUBSCRIPTION)}}>Подписка
                        </div>
                        <div
                            className={"tabs-1 tab-link" + (this.state.currentTab === TABS.SOCIAL_NETWORKS ? ' tab-link-active' : '')}
                            onClick={() => {this._switchTo(TABS.SOCIAL_NETWORKS)}}>Социальные сети
                        </div>
                        <div
                            className={"tabs-1 tab-link" + (this.state.currentTab === TABS.EPISODES_AND_SUBS ? ' tab-link-active' : '')}
                            onClick={() => {this._switchTo(TABS.EPISODES_AND_SUBS)}}>{"Эпизоды" + (this.props.isSublesson ? "" : " и доп.лекции")}
                        </div>
                        <div
                            className={"tabs-1 tab-link" + (this.state.currentTab === TABS.REFERENCES ? ' tab-link-active' : '')}
                            onClick={() => {this._switchTo(TABS.REFERENCES)}}>Литература
                        </div>
                        <div
                            className={"tabs-1 tab-link" + (this.state.currentTab === TABS.RESOURCES ? ' tab-link-active' : '')}
                            onClick={() => {this._switchTo(TABS.RESOURCES)}}>Ресурсы
                        </div>
                    </div>
                </div>
            </div>
            <div className="editor__main-area">
                <div className="main-area__container">
                    <form className={"form-wrapper non-webix-form"} action={"javascript:void(0)"}>
                        <MainTab visible={this.state.currentTab === TABS.MAIN} editMode={this.props.editMode} isSublesson={this.props.isSublesson}/>
                        <SubscriptionTab visible={this.state.currentTab === TABS.SUBSCRIPTION} editMode={this.props.editMode}/>
                        <SocialNetworkTab visible={this.state.currentTab === TABS.SOCIAL_NETWORKS} editMode={this.props.editMode}/>
                        <EpisodesTab visible={this.state.currentTab === TABS.EPISODES_AND_SUBS} editMode={this.props.editMode} isSublesson={this.props.isSublesson}/>
                        <ReferencesTab visible={this.state.currentTab === TABS.REFERENCES} editMode={this.props.editMode}/>
                        <ResourcesTab visible={this.state.currentTab === TABS.RESOURCES} editMode={this.props.editMode}/>
                    </form>
                </div>
            </div>
            <div className="editor__footer">
                <BottomControls hasChanges={hasChanges} enableApplyChanges={this._enableApplyChanges()}
                                onAccept={::this._save} onCancel={::this._cancel} onBack={::this._goBack}/>
            </div>
        </React.Fragment>
    }

    _switchTo(tabName) {
        if (this.state.currentTab !== tabName) {
            this.setState({
                currentTab: tabName
            })
        }
    }

    _goBack() {
        if (this.props.isSublesson) {
            history.push(`/adm/courses/edit/${this.props.course.id}/lessons/edit/${this.props.lesson.CurrParentId}`);
        } else {
            history.push(`/adm/courses/edit/${this.props.course.id}`);
        }
    }

    _cancel() {
        this.props.resetReduxForm('LessonEditor')
        this.props.cancelChanges()
    }

    _save() {
        let {editorValues, editorValid, lesson} = this.props;

        if (!editorValid) {
            return
        }

        this.props.setFixedLesson({
            lessonId: lesson.id,
            description: editorValues.fixDescription,
            active: editorValues.fixed
        })

        let _checkResult = checkExtLinks(editorValues.extLinksValues)

        if (_checkResult && _checkResult.length) {
            let _message = 'Недопустимые ссылки:\n' + _checkResult.join('\n')
            this.props.showErrorDialog(_message)
            return
        }

        this.props.setExtLinks(getExtLinks(editorValues.extLinksValues))

        let _obj = {
            id: this.props.lesson.id,
            CourseId: this.props.course.id,
            Id: editorValues.id,
            Name: editorValues.name,
            State: editorValues.state,
            AuthorId: editorValues.authorId,
            Cover: editorValues.cover.file,
            CoverMeta: editorValues.cover.meta,
            URL: editorValues.URL,
            LessonType: editorValues.lessonType,
            ReadyDate: editorValues.readyDate,
            ShortDescription: editorValues.description ? editorValues.description : " ",
            ParentId: this.props.isSublesson ? this.props.lesson.CurrParentId : null,
            IsAuthRequired: editorValues.isAuthRequired,
            IsSubsRequired: editorValues.isSubsRequired,
            FreeExpDate: editorValues.isSubsRequired ? editorValues.freeExpDate : null,
            Episodes: [],
            References: [],
            Resources: [],
            Childs: (editorValues.subLessons && editorValues.subLessons.length > 0) ? [] : null,
            SnName: editorValues.snName,
            SnDescription: editorValues.snDescription,
            SnPost: editorValues.snPost,
            ExtLinks: getExtLinks(editorValues.extLinksValues),
            IsFreeInPaidCourse: editorValues.isFreeInPaidCourse,
        };

        let {
            ogImageId,
            twitterImageId,
            hasOgImage,
            hasTwitterImage,
        } = this.props;

        if (editorValues.ogImageResourceId || editorValues.twitterImageResourceId || hasOgImage || hasTwitterImage) {
            _obj.Images = [];

            if (editorValues.ogImageResourceId) {
                _obj.Images.push({Id: ogImageId, Type: 'og', ResourceId: editorValues.ogImageResourceId})
            }

            if (editorValues.twitterImageResourceId) {
                _obj.Images.push({Id: twitterImageId, Type: 'twitter', ResourceId: editorValues.twitterImageResourceId})
            }
        }

        this._fillEpisodes(_obj.Episodes);
        this._fillReferences(_obj.References);
        this._fillResources(_obj.Resources);
        if (editorValues.subLessons.length > 0) {
            editorValues.subLessons.map(child => _obj.Childs.push(child));
        }

        this.props.save(_obj, this.props.editMode ? EDIT_MODE_EDIT : EDIT_MODE_INSERT);
    }

    _fillEpisodes(array) {
        this.props.mainEpisodes.map((episode) => {
            array.push({
                Id: episode.Id,
                Name: episode.Name,
                State: episode.State,
                Number: episode.Number,
                Supp: false,
            })
        });
    }

    _fillReferences(array) {
        this.props.editorValues.recommendedRef.map((reference) => {
            let _obj = {};
            if (reference.Id > 0) {
                _obj.Id = reference.Id
            }
            _obj.Description = reference.Description;
            _obj.URL = reference.URL;
            _obj.Number = reference.Number;
            _obj.Recommended = true;

            array.push(_obj);
        });

        this.props.editorValues.commonRef.map((reference) => {
            let _obj = {};
            if (reference.Id > 0) {
                _obj.Id = reference.Id
            }
            _obj.Description = reference.Description;
            _obj.URL = reference.URL;
            _obj.Number = reference.Number;
            _obj.Recommended = false;

            array.push(_obj);
        })
    }

    _fillResources(array) {
        this.props.editorValues.resources.map((resource) => {
            if (resource.FileId) {
                let _meta = JSON.parse(resource.MetaData);
                _meta.fileId = resource.FileId;
                resource.MetaData = JSON.stringify(_meta)
            }

            array.push({
                Id: resource.Id,
                Description: resource.Description,
                ResLanguageId: (typeof resource.ResLanguageId === "number") ? resource.ResLanguageId : null,
                FileName: resource.FileName,
                Name: resource.Name,
                MetaData: resource.MetaData,
                ResType: resource.ResType,
                AltAttribute: resource.AltAttribute,
                ShowInGalery: resource.ShowInGalery,
            })
        });
    }

    _enableApplyChanges() {
        return this.props.editorValid
    }

}

const validate = (values) => {

    const errors = {}

    if (!values.name) {
        errors.name = 'Значение не может быть пустым'
    }

    if (!values.lessonType) {
        errors.lessonType = 'Значение не может быть пустым'
    }

    if (!values.URL) {
        errors.URL = 'Значение не может быть пустым'
    }

    if (!values.authorId) {
        errors.authorId = 'Значение не может быть пустым'
    }

    if (values.fixed && !values.fixDescription) {
        errors.fixDescription = 'Значение не может быть пустым'
    }

    return errors
}

let LessonEditorWrapper = reduxForm({
    form: 'LessonEditor',
    validate,
})(LessonEditorForm);

function mapStateToProps(state) {
    return {
        hasChanges: state.singleLesson.hasChanges ||
            state.lessonMainEpisodes.hasChanges ||
            isDirty('LessonEditor')(state),
        editorValues: getFormValues('LessonEditor')(state),
        editorValid: isValid('LessonEditor')(state),

        course: state.singleCourse.current,
        lesson: state.singleLesson.current,
        saving: state.singleLesson.saving,

        ogImageId: state.singleLesson.ogImageId,
        twitterImageId: state.singleLesson.twitterImageId,
        hasOgImage: state.singleLesson.hasOgImage,
        hasTwitterImage: state.singleLesson.hasTwitterImage,
        ogImageResourceId: state.singleLesson.ogImageResourceId,
        twitterImageResourceId: state.singleLesson.twitterImageResourceId,

        mainEpisodes: state.lessonMainEpisodes.current,
        recommendedRef: state.lessonRecommendedRefs.current,
        commonRef: state.lessonCommonRefs.current,

        fixedLessonId: fixedLessonIdSelector(state),
        fixDescription: fixedObjDescrSelector(state),

        activeTabs: activeTabsSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({resetReduxForm: reset, showErrorDialog, cancelChanges, setExtLinks, setFixedLesson, save, setActiveTab}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(LessonEditorWrapper)