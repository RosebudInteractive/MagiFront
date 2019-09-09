import React from 'react'
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import LoadingPage from '../../components/common/loading-page'
import SavingBlock from '../../components/common/saving-page'
import BottomControls from '../../components/bottom-contols/buttons'
import ErrorDialog from '../../components/dialog/error-dialog'
import CourseCategoryDialog from "../../components/course-editor/dialogs/category-dialog";
import CourseFormWrapper from '../../components/course-editor/form-wrapper'
import CourseAuthorDialog from '../../components/course-editor/dialogs/author-dialog'
import LayoutVer2Tab, {LAYOUT_VER2_FORM} from "../../components/course-editor/tabs/layout-ver2-tab";
import SocialNetworkTab from "../../components/course-editor/tabs/social-network-tab";
import SubscriptionTab from '../../components/course-editor/tabs/subscription-tab'
import AuthorsTab from '../../components/course-editor/tabs/authors-and-categories'
import LessonsTab from '../../components/course-editor/tabs/lessons'
import TestsTab from '../../components/course-editor/tabs/tests-tabs'

import * as singleCourseActions from "../../actions/course/courseActions";
import {showErrorDialog} from '../../actions/app-actions';
import {getAuthors} from "../../actions/authorsListActions";
import {getCategories} from "../../actions/categoriesListActions";
import {getLanguages} from "../../actions/languages-actions";
import {checkExtLinks, convertYouTubeWatchLinkToEmbed, getExtLinks} from "../../tools/link-tools";
import {getParameters, parametersFetchingSelector, setFixedCourse,} from "adm-ducks/params";
import {setActiveTab, activeTabsSelector} from "adm-ducks/app";
import {getTests, loadingSelector as testLoading} from "adm-ducks/test-list";
import {getFormValues, isValid, isDirty, reset,} from 'redux-form'
import {Prompt} from "react-router-dom";

import {EDIT_MODE_EDIT, EDIT_MODE_INSERT} from '../../constants/Common'

const TABS = {
    MAIN: 'MAIN',
    LAYOUT_VER2: 'LAYOUT_VER2',
    SOCIAL_NETWORKS: 'SOCIAL_NETWORKS',
    SUBSCRIPTION: 'SUBSCRIPTION',
    AUTHORS: 'AUTHORS',
    LESSONS: 'LESSONS',
    TESTS: 'TESTS',
}

const IMAGE_TYPE = {
    OG: 'og',
    TWITTER: 'twitter',
}

class CourseEditor extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            editMode: this.props.courseId > 0,
            currentTab: TABS.MAIN,
        }
    }

    componentDidMount() {
        this.props.getAuthors();
        this.props.getCategories();
        this.props.getLanguages();
        this.props.getParameters()

        if (this.state.editMode) {
            this.props.getTests(this.props.courseId)
        }


        if (this.state.editMode) {
            this.props.courseActions.get(this.props.courseId)
        } else {
            this.props.courseActions.create()
        }

        let _activeTab = this.props.activeTabs.get('CourseEditor')
        if (_activeTab) {
            this.setState({
                currentTab: _activeTab,
            })
        }
    }

    componentDidUpdate(prevProps, prevState) {
        let _needRefreshAfterSave = prevProps.savingCourse && !this.props.savingCourse && !this.props.courseError,
            _needSwitchToEditMode = !prevState.editMode && _needRefreshAfterSave

        if (_needSwitchToEditMode) {
            let _newRout = `/adm/courses/edit/${this.props.course.id}`;
            this.props.history.push(_newRout);
            this.setState({editMode: true})
        }

        if (_needRefreshAfterSave) {
            this.props.courseActions.get(this.props.course.id)
        }
    }

    componentWillUnmount() {
        this.props.setActiveTab({page: 'CourseEditor', value: this.state.currentTab})
    }

    render() {
        const {fetching, hasChanges, courseId, savingCourse,} = this.props;

        return <React.Fragment>
            {
                fetching ?
                    <LoadingPage/>
                    :
                    <div className="editor course_editor">
                        <SavingBlock visible={savingCourse}/>
                        <Prompt when={hasChanges}
                                message={'Есть несохраненные данные.\n Перейти без сохранения?'}/>
                        <div className='editor__head'>
                            <div className="tabs tabs-1" key='tab1'>
                                <div className="tab-links">
                                    <div
                                        className={"tabs-1 tab-link" + (this.state.currentTab === TABS.MAIN ? ' tab-link-active' : '')}
                                        onClick={() => {
                                            this._switchTo(TABS.MAIN)
                                        }}>Основные
                                    </div>
                                    <div
                                        className={"tabs-1 tab-link" + (this.state.currentTab === TABS.LAYOUT_VER2 ? ' tab-link-active' : '')}
                                        onClick={() => {
                                            this._switchTo(TABS.LAYOUT_VER2)
                                        }}>Новый формат
                                    </div>
                                    <div
                                        className={"tabs-1 tab-link" + (this.state.currentTab === TABS.SOCIAL_NETWORKS ? ' tab-link-active' : '')}
                                        onClick={() => {
                                            this._switchTo(TABS.SOCIAL_NETWORKS)
                                        }}>Социальные сети
                                    </div>
                                    <div
                                        className={"tabs-1 tab-link" + (this.state.currentTab === TABS.SUBSCRIPTION ? ' tab-link-active' : '')}
                                        onClick={() => {
                                            this._switchTo(TABS.SUBSCRIPTION)
                                        }}>Подписка
                                    </div>
                                    <div
                                        className={"tabs-1 tab-link" + (this.state.currentTab === TABS.AUTHORS ? ' tab-link-active' : '')}
                                        onClick={() => {
                                            this._switchTo(TABS.AUTHORS)
                                        }}>Авторы и категории
                                    </div>
                                    <div
                                        className={"tabs-1 tab-link" + (this.state.currentTab === TABS.LESSONS ? ' tab-link-active' : '')}
                                        onClick={() => {
                                            this._switchTo(TABS.LESSONS)
                                        }}>Лекции
                                    </div>
                                    <div
                                        className={"tabs-1 tab-link" + (this.state.currentTab === TABS.TESTS ? ' tab-link-active' : '')}
                                        onClick={() => {
                                            this._switchTo(TABS.TESTS)
                                        }}>Тесты
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="editor__main-area">
                            <div className="main-area__container">
                                <CourseFormWrapper visible={this.state.currentTab === TABS.MAIN}
                                                   editMode={this.state.editMode}/>
                                <LayoutVer2Tab visible={this.state.currentTab === TABS.LAYOUT_VER2}
                                                  editMode={this.props.editMode}/>
                                <SocialNetworkTab visible={this.state.currentTab === TABS.SOCIAL_NETWORKS}
                                                  editMode={this.props.editMode}/>
                                <SubscriptionTab editMode={this.state.editMode}
                                                 visible={this.state.currentTab === TABS.SUBSCRIPTION}/>
                                <AuthorsTab editMode={this.state.editMode}
                                            visible={this.state.currentTab === TABS.AUTHORS}/>
                                <LessonsTab editMode={this.state.editMode} courseId={courseId}
                                            visible={this.state.currentTab === TABS.LESSONS}/>
                                <TestsTab editMode={this.state.editMode} courseId={courseId}
                                          visible={this.state.currentTab === TABS.TESTS}/>
                            </div>

                            <ErrorDialog/>
                            <CourseAuthorDialog/>
                            <CourseCategoryDialog/>
                        </div>
                        <div className="editor__footer">
                            <BottomControls hasChanges={hasChanges} enableApplyChanges={this._enableApplyChanges()}
                                            onAccept={::this._save} onCancel={::this._cancel} onBack={::this._goBack}/>
                        </div>
                    </div>
            }
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
        this.props.history.push('/adm/courses');
    }


    _save() {
        let {editorValues, subscriptionValues, snValues, layoutVer2Values, editorValid, courseId} = this.props;

        if (!editorValid) {
            return
        }

        this.props.setFixedCourse({
            courseId: courseId,
            description: editorValues.fixDescription,
            active: editorValues.fixed
        })

        let _checkResult = checkExtLinks(editorValues.extLinksValues)

        if (_checkResult && _checkResult.length) {
            let _message = 'Недопустимые ссылки:\n' + _checkResult.join('\n')
            this.props.showErrorDialog(_message)
            return
        }

        this.props.courseActions.setExtLinks(getExtLinks(editorValues.extLinksValues))

        let _obj = {
            id: courseId,
            Id: courseId,
            Name: editorValues.name,
            State: editorValues.state,
            Cover: editorValues.cover.file,
            CoverMeta: editorValues.cover.meta,
            LanguageId: editorValues.languageId,
            URL: editorValues.URL,
            Description: editorValues.description,
            Mask: editorValues.cover.mask,
            Authors: [],
            Categories: [],
            Lessons: [],
            ExtLinks: getExtLinks(editorValues.extLinksValues),
            OneLesson: !!editorValues.oneLesson,
            VideoIntroLink: convertYouTubeWatchLinkToEmbed(editorValues.videoIntroLink),
            VideoIntwLink: convertYouTubeWatchLinkToEmbed(editorValues.videoIntwLink),
            IsPaid: subscriptionValues.IsPaid, // признак платности
            IsSubsFree: subscriptionValues.IsSubsFree, // признак бесплатности в рамках подписки
            Price: _roundNum(subscriptionValues.Price), // цена
            DPrice: subscriptionValues.DPrice, // цена со скидкой
            PaidTp: +subscriptionValues.PaidTp, // 1-безусловно платный, 2-платный для зарегистрировавшихся после "PaidRegDate"
            PaidRegDate: (+subscriptionValues.PaidTp === 2) ? subscriptionValues.PaidRegDate : null, // платный для пользователей зарегистрировавшихся после
            SnName: snValues.snName,
            SnDescription: snValues.snDescription,
            SnPost: snValues.snPost,
            IsLandingPage: layoutVer2Values.isLandingPage,
            ShortDescription: layoutVer2Values.shortDescription,
            TargetAudience: layoutVer2Values.targetAudience,
            Aims: layoutVer2Values.aims,
            EstDuration: this._valueToSeconds(layoutVer2Values.estDuration),
            LandCover: layoutVer2Values.cover.file,
            LandCoverMeta: layoutVer2Values.cover.meta,
        };


        const _ogImage = this._getImage(IMAGE_TYPE.OG),
            _twitterImage = this._getImage(IMAGE_TYPE.TWITTER)

        if (snValues.ogImage.file || snValues.twitterImage.file || _ogImage || _twitterImage) {
            _obj.Images = [];

            if (snValues.ogImage.file) {
                _obj.Images.push({
                    Id: _ogImage ? _ogImage.Id : -1,
                    Type: IMAGE_TYPE.OG,
                    FileName: snValues.ogImage.file,
                    MetaData: JSON.stringify(snValues.ogImage.meta)
                })
            }

            if (snValues.twitterImage.file) {
                _obj.Images.push({
                    Id: _twitterImage ? _twitterImage.Id : -2,
                    Type: IMAGE_TYPE.TWITTER,
                    FileName: snValues.twitterImage.file,
                    MetaData: JSON.stringify(snValues.twitterImage.meta)
                })
            }
        }

        if (subscriptionValues.Perc) {
            _obj.Discount = { // скидка
                Description: subscriptionValues.Description, // описание скидки
                Perc: _roundNum(subscriptionValues.Perc), // % скидки
                FirstDate: subscriptionValues.FirstDate, // начало действия
                LastDate: subscriptionValues.LastDate, // конец действия
            }
        } else if (subscriptionValues.Perc === null) {
            _obj.Discount = {
                Perc: null
            }
        }


        if (this.props.course.ProductId) {
            _obj.ProductId = this.props.course.ProductId // продукт, который продаем
        }

        _obj.Authors.push(...this.props.courseAuthors);
        _obj.Categories.push(...this.props.courseCategories);
        this._fillLessons(_obj.Lessons);

        this.props.courseActions.save(_obj, this.state.editMode ? EDIT_MODE_EDIT : EDIT_MODE_INSERT);
    }

    _getImage(type) {
        return (this.props.course && this.props.course.Images) ? this.props.course.Images.find(image => image.Type === type) : null
    }

    _cancel() {
        this.props.courseActions.cancelChanges()
        this.props.resetReduxForm('CourseEditor')
        this.props.resetReduxForm('CourseSubscriptionForm')
        this.props.resetReduxForm('CourseSocialNetworkForm')
        this.props.resetReduxForm(LAYOUT_VER2_FORM)
    }

    _fillLessons(array) {
        this.props.courseLessons.map((lesson) => {
            array.push({
                LessonId: lesson.Id,
                State: lesson.State,
                ReadyDate: new Date(lesson.ReadyDate),
            })
        })
    }

    _enableApplyChanges() {
        return this.props.editorValid && (this.props.courseAuthors.length > 0) && (this.props.courseCategories.length > 0)
    }

    _valueToSeconds(value) {
        return null
    }
}

const _roundNum = (value) => {
    return Math.round(value * 100) / 100;
}

function mapStateToProps(state, ownProps) {
    return {
        courseId: ownProps.match ? Number(ownProps.match.params.id) : null,

        course: state.singleCourse.current,
        savingCourse: state.singleCourse.saving,
        courseError: state.singleCourse.error,
        authors: state.authorsList.authors,
        categories: state.categoriesList.categories,

        courseAuthors: state.courseAuthors.current,
        courseCategories: state.courseCategories.current,
        courseLessons: state.courseLessons.current,

        hasChanges: state.singleCourse.hasChanges ||
            state.courseAuthors.hasChanges ||
            state.courseCategories.hasChanges ||
            state.courseLessons.hasChanges ||
            isDirty('CourseEditor')(state) ||
            isDirty('CourseSubscriptionForm')(state) ||
            isDirty('CourseSocialNetworkForm')(state),

        fetching: state.authorsList.fetching ||
            state.categoriesList.fetching ||
            state.languages.fetching ||
            state.singleCourse.fetching ||
            parametersFetchingSelector(state) ||
            testLoading(state),

        editorValues: getFormValues('CourseEditor')(state),
        subscriptionValues: getFormValues('CourseSubscriptionForm')(state),
        layoutVer2Values: getFormValues(LAYOUT_VER2_FORM)(state),
        snValues: getFormValues('CourseSocialNetworkForm')(state),
        editorValid: isValid('CourseEditor')(state)
            && isValid('CourseSubscriptionForm')(state)
            && isValid('CourseSocialNetworkForm')(state)
            && isValid(LAYOUT_VER2_FORM)(state),
        activeTabs: activeTabsSelector(state)
    }
}

function mapDispatchToProps(dispatch) {
    return {
        showErrorDialog: bindActionCreators(showErrorDialog, dispatch),
        courseActions: bindActionCreators(singleCourseActions, dispatch),
        getAuthors: bindActionCreators(getAuthors, dispatch),
        getCategories: bindActionCreators(getCategories, dispatch),
        getLanguages: bindActionCreators(getLanguages, dispatch),

        getParameters: bindActionCreators(getParameters, dispatch),
        setFixedCourse: bindActionCreators(setFixedCourse, dispatch),
        resetReduxForm: bindActionCreators(reset, dispatch),
        setActiveTab: bindActionCreators(setActiveTab, dispatch),
        getTests: bindActionCreators(getTests, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CourseEditor);