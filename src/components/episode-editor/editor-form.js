import React from 'react'
import {connect} from "react-redux";
import {bindActionCreators} from 'redux';
import {getFormValues, isDirty, isValid, reduxForm, reset} from "redux-form";
import SavingBlock from "../common/saving-page";
import {Prompt} from "react-router-dom";
import BottomControls from "../bottom-contols/buttons";
import MainTab from "./tabs/main-tab";
import TocTab from "./tabs/toc-tab";
import ContentTab from "./tabs/content-tab";
import history from "../../history";
import {activeTabsSelector, setActiveTab} from "adm-ducks/app";
import {cancelChanges, save} from "../../actions/episode/episode-actions";
import PropTypes from "prop-types";

const TABS = {
    MAIN: 'MAIN',
    TOC: 'TOC',
    CONTENT: 'CONTENT',
}

class EpisodeEditorForm extends React.Component {

    static propTypes = {
        editMode: PropTypes.bool,
        courseId: PropTypes.number,
        lessonId: PropTypes.number,
        sublessonId: PropTypes.number,
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
        let _activeTab = this.props.activeTabs.get('EpisodeEditor')
        if (_activeTab) {
            this.setState({
                currentTab: _activeTab,
            })
        }
    }

    componentWillUnmount() {
        this.props.setActiveTab({page: 'EpisodeEditor', value: this.state.currentTab})
    }


    render() {
        const {hasChanges, saving} = this.props;

        return <React.Fragment>
            <SavingBlock visible={saving}/>
            <Prompt when={hasChanges}
                    message={'Есть несохраненные данные.\n Перейти без сохранения?'}/>
            <div className='editor__head'>
                <div className="tabs tabs-1" key='tab1'>
                    <div className="tab-links">
                        <div
                            className={"tabs-1 tab-link" + (this.state.currentTab === TABS.MAIN ? ' tab-link-active' : '')}
                            onClick={() => { this._switchTo(TABS.MAIN) }}>Основные
                        </div>
                        <div
                            className={"tabs-1 tab-link" + (this.state.currentTab === TABS.TOC ? ' tab-link-active' : '')}
                            onClick={() => { this._switchTo(TABS.TOC) }}>Оглавление эпизода
                        </div>
                        <div
                            className={"tabs-1 tab-link" + (this.state.currentTab === TABS.CONTENT ? ' tab-link-active' : '')}
                            onClick={() => { this._switchTo(TABS.CONTENT) }}>Компоненты
                        </div>
                    </div>
                </div>
            </div>
            <div className="editor__main-area">
                <div className="main-area__container">
                    <form className={"form-wrapper non-webix-form"} action={"javascript:void(0)"}>
                        <MainTab visible={this.state.currentTab === TABS.MAIN} editMode={this.props.editMode}/>
                        <TocTab visible={this.state.currentTab === TABS.TOC} editMode={this.props.editMode}/>
                        <ContentTab visible={this.state.currentTab === TABS.CONTENT} editMode={this.props.editMode} lessonId={1}/>
                    </form>
                </div>
            </div>
            <div className="editor__footer">
                <BottomControls hasChanges={hasChanges} enableApplyChanges={this._enableApplyChanges()}
                                onAccept={::this._save} onCancel={::this._cancel} onBack={::this._goBack}/>
            </div>
        </React.Fragment>
    }

    _init() {
        let {episode,} = this.props,
            _episode = episode ? episode : this._getNewEpisode()

        if (_episode) {
            this.props.initialize({
                name: _episode.Name,
                number: _episode.Number,
                episodeType: _episode.EpisodeType,

                supp: _episode.Supp,
                state: _episode.State,
                transcript: _episode.Transcript,

            })
        }
    }

    _getNewEpisode() {
        return {}
    }

    _switchTo(tabName) {
        if (this.state.currentTab !== tabName) {
            this.setState({
                currentTab: tabName
            })
        }
    }

    _enableApplyChanges() {
        return this.props.editorValid
    }

    _goBack() {
        const {courseId, lessonId, sublessonId} = this.props,
            _isSublesson = !!sublessonId

        if (_isSublesson) {
            history.push(`/adm/courses/edit/${courseId}/lessons/edit/${lessonId}/sub-lessons/edit/${sublessonId}`);
        } else {
            history.push(`/adm/courses/edit/${courseId}/lessons/edit/${lessonId}`);
        }
    }

    _cancel() {
        this.props.resetReduxForm('EpisodeEditor')
        this.props.cancelChanges()
    }

    _save() {
        let {editorValues, editorValid} = this.props;

        if (!editorValid) {
            return
        }
    }
}


const validate = (values) => {
    const errors = {}

    if (!values.name) {
        errors.name = 'Значение не может быть пустым'
    }

    if (!values.episodeType) {
        errors.episodeType = 'Значение не может быть пустым'
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

let EpisodeEditorWrapper = reduxForm({
    form: 'EpisodeEditor',
    validate,
})(EpisodeEditorForm);

function mapStateToProps(state) {
    return {
        hasChanges: state.singleEpisode.hasChanges ||
            state.episodeToc.hasChanges ||
            state.episodeContent.hasChanges ||
            isDirty('EpisodeEditor')(state),

        editorValues: getFormValues('EpisodeEditor')(state),
        editorValid: isValid('EpisodeEditor')(state),

        episode: state.singleEpisode.current,
        lesson: state.singleLesson.current,



        activeTabs: activeTabsSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({resetReduxForm: reset, cancelChanges, setActiveTab}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(EpisodeEditorWrapper)