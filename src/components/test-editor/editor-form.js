import React from 'react'
import {connect} from "react-redux";
import {bindActionCreators} from 'redux';
import {getFormValues, isDirty, isValid, reduxForm, reset} from "redux-form";
import SavingBlock from "../common/saving-page";
import {Prompt} from "react-router-dom";
import BottomControls from "../bottom-contols/buttons";
import MainTab from "./tabs/main-tab";
import QuestionsTab from "./tabs/questions-tab";
import SocialTab from "./tabs/social-network-tab";
import {activeTabsSelector, setActiveTab} from "adm-ducks/app";
import {testSelector, questionsSelector, savingSelector, insertTest, updateTest, backToCourse,} from "adm-ducks/single-test";
import PropTypes from "prop-types";

const EDITOR_NAME = "TestEditor"

const TABS = {
    MAIN: 'MAIN',
    SOCIAL: 'SOCIAL',
    QUESTIONS: 'QUESTIONS',
}

const IMAGE_TYPE = {
    OG: 'og',
    TWITTER: 'twitter',
}

class TestEditorForm extends React.Component {

    static propTypes = {
        editMode: PropTypes.bool,
        courseId: PropTypes.number,
    }

    constructor(props) {
        super(props)

        this.state = {
            currentTab: TABS.MAIN,
        }
    }

    UNSAFE_componentWillMount() {
        let _activeTab = this.props.activeTabs.get(EDITOR_NAME)
        if (_activeTab) {
            this.setState({
                currentTab: _activeTab,
            })
        }

        this._init()
    }

    componentWillUnmount() {
        this.props.setActiveTab({page: EDITOR_NAME, value: this.state.currentTab})
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
                            onClick={() => { this._switchTo(TABS.MAIN) }}>Основные
                        </div>
                        <div
                            className={"tabs-1 tab-link" + (this.state.currentTab === TABS.SOCIAL ? ' tab-link-active' : '')}
                            onClick={() => { this._switchTo(TABS.SOCIAL) }}>Социальные сети
                        </div>
                        <div
                            className={"tabs-1 tab-link" + (this.state.currentTab === TABS.QUESTIONS ? ' tab-link-active' : '')}
                            onClick={() => { this._switchTo(TABS.QUESTIONS) }}>Вопросы
                        </div>
                    </div>
                </div>
            </div>
            <div className="editor__main-area">
                <div className="main-area__container">
                    <form className={"form-wrapper non-webix-form"} action={"javascript:void(0)"}>
                        <MainTab visible={this.state.currentTab === TABS.MAIN} editMode={this.props.editMode}/>
                        <SocialTab visible={this.state.currentTab === TABS.SOCIAL} editMode={this.props.editMode}/>
                        <QuestionsTab visible={this.state.currentTab === TABS.QUESTIONS} editMode={this.props.editMode}/>
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
        let {test, questions} = this.props,
            _test = test ? test : {}

        const _ogImage = this._getImage(IMAGE_TYPE.OG),
            _twitterImage = this._getImage(IMAGE_TYPE.TWITTER)

        if (_test) {
            this.props.initialize({
                testTypeId: test.TestTypeId,
                courseId: test.CourseId,
                lessonId: test.LessonId ? test.LessonId : -1,
                name: test.Name,
                description: test.Description,
                isAuthRequired: test.IsAuthRequired,
                method: test.Method,
                maxQ: test.MaxQ,
                fromLesson: !!test.FromLesson,
                isTimeLimited: !!test.IsTimeLimited,
                status: test.Status,
                questions: questions,
                cover: {
                    file: test.Cover,
                    meta: test.CoverMeta,
                },
                URL: _test.URL,
                snName: _test.SnName,
                snDescription: _test.SnDescription,
                snPost: _test.SnPost,
                images: _test.Images ? _test.Images : [],
                ogImage: {
                    file: _ogImage ? _ogImage.FileName : '',
                    meta: _ogImage ? JSON.parse(_ogImage.MetaData) : '',
                },
                twitterImage : {
                    file: _twitterImage ? _twitterImage.FileName : '',
                    meta: _twitterImage ? JSON.parse(_twitterImage.MetaData) : '',
                },
            })
        }
    }

    _getImage(type) {
        return (this.props.test && this.props.test.Images) ? this.props.test.Images.find(image => image.Type === type) : null
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
        this.props.backToCourse(this.props.course.Id)
    }

    _cancel() {
        this.props.resetReduxForm(EDITOR_NAME)
    }

    _save() {
        let {editorValues, editorValid, test} = this.props;

        if (!editorValid) {
            return
        }

        let _obj = {
            Id: test.Id ? test.Id : -1,
            TestTypeId: +editorValues.testTypeId,
            CourseId: editorValues.courseId ? +editorValues.courseId : null,
            LessonId: (editorValues.lessonId && (+editorValues.lessonId > 0)) ? +editorValues.lessonId : null,
            Name: editorValues.name,
            Description: editorValues.description,
            IsAuthRequired: editorValues.isAuthRequired,
            Method: +editorValues.method,
            MaxQ: +editorValues.maxQ,
            FromLesson: !!+editorValues.fromLesson,
            IsTimeLimited: !!+editorValues.isTimeLimited,
            Status: +editorValues.status,
            Questions: [],
            Cover: editorValues.cover.file,
            CoverMeta: editorValues.cover.meta,
            URL: editorValues.URL,
            SnName: editorValues.snName,
            SnDescription: editorValues.snDescription,
            SnPost: editorValues.snPost,
        };

        this._fillQuestions(_obj.Questions);

        const _ogImage = this._getImage(IMAGE_TYPE.OG),
            _twitterImage = this._getImage(IMAGE_TYPE.TWITTER)

        if (editorValues.ogImage.file || editorValues.twitterImage.file || _ogImage || _twitterImage) {
            _obj.Images = [];

            if (editorValues.ogImage.file) {
                _obj.Images.push({
                    Id: _ogImage ? _ogImage.Id : -1,
                    Type: IMAGE_TYPE.OG,
                    FileName: editorValues.ogImage.file,
                    MetaData: JSON.stringify(editorValues.ogImage.meta)
                })
            }

            if (editorValues.twitterImage.file) {
                _obj.Images.push({
                    Id: _twitterImage ? _twitterImage.Id : -2,
                    Type: IMAGE_TYPE.TWITTER,
                    FileName: editorValues.twitterImage.file,
                    MetaData: JSON.stringify(editorValues.twitterImage.meta)
                })
            }
        }

        if (this.props.editMode) {
            this.props.updateTest(_obj);
        } else {
            this.props.insertTest(_obj);
        }
    }

    _fillQuestions(array) {
        this.props.editorValues.questions.map((question) => {
            let _question = {
                AnswTime: +question.AnswTime,
                Text: question.Text,
                Picture: question.Picture,
                PictureMeta: question.PictureMeta,
                AnswType: +question.AnswType,
                Score: +question.Score,
                StTime: +question.StTime,
                EndTime: +question.EndTime,
                AllowedInCourse: !!+question.AllowedInCourse,
                CorrectAnswResp: question.CorrectAnswResp,
                WrongAnswResp: question.WrongAnswResp,
                AnswBool: null,
                AnswInt: null,
                AnswText: null,
                Comment: question.Comment,
                Answers: [],
            }

            switch (+question.AnswType) {
                case 1 : {
                    _question.AnswInt = +question.AnswInt
                    break
                }

                case 2: {
                    _question.AnswBool = !!(+question.AnswBool)
                    break
                }

                case 3:
                case 4: {
                    _question.Answers = question.Answers.map((answer) => {
                        return {Text: answer.Text, IsCorrect: !!+answer.IsCorrect}
                    })
                    break
                }

                case 5: {
                    _question.AnswText = question.AnswText
                    break
                }

                default: {
                    break
                }
            }

            array.push(_question)
        });
    }
}


const validate = (values) => {
    const errors = {}

    if (!values.name) {
        errors.name = 'Значение не может быть пустым'
    }

    if (!values.method) {
        errors.method = 'Значение не может быть пустым'
    }

    if (!values.testTypeId) {
        errors.testTypeId = 'Значение не может быть пустым'
    }

    if (values.maxQ && !$.isNumeric(values.maxQ)) {
        errors.maxQ = 'Значение должно быть числовым'
    }

    return errors
}

let TestEditorWrapper = reduxForm({
    form: EDITOR_NAME,
    validate,
})(TestEditorForm);

function mapStateToProps(state) {
    return {
        test: testSelector(state),
        course: state.singleCourse.current,
        questions: questionsSelector(state),

        hasChanges: isDirty(EDITOR_NAME)(state),

        editorValues: getFormValues(EDITOR_NAME)(state),
        editorValid: isValid(EDITOR_NAME)(state),

        activeTabs: activeTabsSelector(state),
        saving: savingSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({resetReduxForm: reset, setActiveTab, insertTest, updateTest, backToCourse}, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(TestEditorWrapper)