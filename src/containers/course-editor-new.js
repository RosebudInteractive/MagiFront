import React from 'react'

import LoadingPage from '../components/common/loading-page'
import BottomControls from '../components/bottom-contols'
import ErrorDialog from '../components/dialog/error-dialog'
import CourseFormWrapper from '../components/course-editor/form-wrapper'
import CourseAuthorDialog from '../components/course-editor/dialogs/author-dialog'

import * as singleCourseActions from "../actions/course/courseActions";

import * as appActions from '../actions/app-actions';
import * as authorsActions from "../actions/authorsListActions";
import * as categoriesActions from "../actions/categoriesListActions";
import * as languagesActions from "../actions/languages-actions";

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import FixControl from '../components/course-editor/fix-course-wrapper';

import {checkExtLinks, getExtLinks} from "../tools/link-tools";
import {
    disableButtons,
    enableButtons,
} from "adm-ducks/app";
import {
    getParameters,
    setFixedCourse,
} from "adm-ducks/params";
import {getFormValues, isValid, isDirty, reset, focus} from 'redux-form'
import {Prompt} from "react-router-dom";
import CourseCategoryDialog from "../components/course-editor/dialogs/category-dialog";
import DetailsWrapper from "../components/course-editor/details";

class CourseEditor extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            editMode: this.props.courseId > 0
        }
    }

    componentDidMount() {
        this.props.authorsActions.getAuthors();
        this.props.categoriesActions.getCategories();
        this.props.languagesActions.getLanguages();
        this.props.getParameters()

        if (this.state.editMode) {
            this.props.courseActions.get(this.props.courseId)
        } else {
            this.props.courseActions.create()
        }
    }

    componentWillReceiveProps(next) {
        const {course} = next;
        //
        // if (this.editMode === EDIT_MODE_INSERT) {
        //     if (!course) {
        //         this.objectActions.create(this._getInitStateOfNewObject(next));
        //     }
        // }
        //
        this.cover = course ? course.Cover : null;
        this.coverMeta = course ? course.CoverMeta : null;
        this.mask = course ? course.Mask : null;
    }

    componentDidUpdate(prevProps) {
        // if (this.props.hasChanges) {
        //     this.handleChangeDataOnWebixForm()
        // }
        //
        // super.componentDidUpdate(prevProps)
    }

    render() {
        const {fetching, hasChanges, courseId} = this.props;

        // if (fetching) {
        //     this._dataLoaded = false;
        //     this._validateResult = {};
        // }

        return (
            fetching ?
                <LoadingPage/>
                :
                <div className="course_editor">
                    <Prompt when={hasChanges}
                            message={'Есть несохраненные данные.\n Перейти без сохранения?'}/>
                    <CourseFormWrapper/>
                    <DetailsWrapper editMode={this.state.editMode} courseId={courseId}/>
                    <ErrorDialog/>
                    <CourseAuthorDialog/>
                    <CourseCategoryDialog/>
                </div>
        )
    }

// <div className="control-wrapper">
// <div id='webix_editors_wrapper' className='webix_editors_wrapper'/>
// {this._getNonWebixForm()}
// </div>
// {this._getWebixForm()}

// <BottomControls editor={this} hasChanges={hasChanges} onAccept={::this._save}
// onCancel={::this._cancel}/>

    getRootRout() {
        return '/adm/courses'
    }

    _save(value) {
        this.props.focusReduxForm('FixingBlock', 'description')

        if (!this.props.fixFormValid) {
            return
        }
        this.props.setFixedCourse({courseId: value.id, ...this.props.fixFormValues})

        let _checkResult = checkExtLinks(value.extLinksValues)

        if (_checkResult && _checkResult.length) {
            let _message = 'Недопустимые ссылки:\n' + _checkResult.join('\n')
            this.props.appActions.showErrorDialog(_message)
            return
        }

        this.props.courseActions.setExtLinks(getExtLinks(value.extLinksValues))

        let _obj = {
            id: value.id,
            Id: value.id,
            Name: value.Name,
            State: value.State,
            Cover: value.Cover,
            CoverMeta: JSON.stringify(this.coverMeta),
            LanguageId: value.LanguageId,
            URL: value.URL,
            Description: value.Description,
            Mask: value.Mask,
            Authors: [],
            Categories: [],
            Lessons: [],
            ExtLinks: getExtLinks(value.extLinksValues),
            OneLesson: !!value.OneLesson,
        };

        _obj.Authors.push(...this.props.courseAuthors);
        _obj.Categories.push(...this.props.courseCategories);
        this._fillLessons(_obj.Lessons);

        super._save(_obj);
    }

    _cancel() {
        super._cancel()

        this.props.resetReduxForm('FixingBlock')
    }

    get coverMeta() {
        return this._coverMeta;
    }

    set coverMeta(value) {
        if ((!!value) && (typeof (value) === 'string')) {
            this._coverMeta = JSON.parse(value)
        } else {
            this._coverMeta = value
        }
    }

    _getCoverInfo() {
        let _meta = this.coverMeta;
        return {
            // path: _meta ? ('/data/' + (_meta.content.m ? (_meta.path +  _meta.content.m) : this.cover)) : null,
            path: _meta ? '/data/' + this.cover : null,
            heightRatio: _meta ? (_meta.size.height / _meta.size.width) : 0
        };
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

    _checkLessonsState(newState) {
        if (!newState) {
            return false
        }

        if (newState === 'P') {
            return this.props.courseLessons.some((lesson) => {
                return lesson.State === 'R'
            })
        } else {
            return true
        }
    }

    _getNonWebixForm() {
        let _data = this.getObject();

        return <FixControl course={_data} canFix={this._canFixCourse()}/>
    }


    _canFixCourse() {
        let _data = this.getObject()

        return ((_data && !_data.OneLesson) || (window.$$('one-lesson-checkbox') && !window.$$('one-lesson-checkbox').getValue()))
    }

    _getMasks() {
        let _masks = [];
        for (let i = 1; i <= 12; i++) {
            _masks.push({id: '_mask' + i.toString().padStart(2, '0'), value: 'Маска ' + i})
        }

        return _masks;
    }

    _getExtElements() {
        let that = this;

        return [
            {
                view: "text",
                align: 'center',
                name: "Name",
                label: "Название курса",
                placeholder: "Введите название",
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
                view: 'text',
                align: 'center',
                name: 'URL',
                label: 'URL',
                placeholder: "Введите URL",
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
                view: "combo",
                name: "State",
                label: "Состояние",
                placeholder: "Выберите состояние",
                options: [
                    {id: 'D', value: 'Черновик'},
                    {id: 'P', value: 'Опубликованный'},
                    {id: 'A', value: 'Архив'}
                ],
                labelWidth: labelWidth,
                validate: function (value) {
                    return that._checkLessonsState(value)
                },
                invalidMessage: 'Недопустимое состояние',
                on: {
                    onChange: function () {
                        that._externalValidate(this);
                    },
                },
            },
            {
                view: "combo", name: "LanguageId", label: "Язык", placeholder: "Выберите язык",
                options: this.getLanguagesArray(),
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
                cols: [
                    {
                        rows: [
                            {
                                view: "label",
                                label: "Обложка курса",
                                width: labelWidth,
                                height: 38,
                            }
                        ]

                    },
                    {
                        rows: [
                            {
                                view: 'text',
                                name: 'Cover',
                                id: 'cover-file',
                                // validate: window.webix.rules.isNotEmpty,
                                // invalidMessage: "Значение не может быть пустым",
                                readonly: true,
                                width: 360,
                                on: {
                                    onChange: function () {
                                        that._externalValidate(this);
                                        let _coverTemplate = window.$$('cover_template');
                                        if (!this.getValue()) {
                                            this.show();
                                            _coverTemplate.hide()
                                        } else {
                                            this.hide();
                                            _coverTemplate.show()
                                        }
                                    },
                                },
                            },
                            {
                                view: 'text',
                                name: 'CoverMeta',
                                id: 'cover-meta',
                                hidden: true,
                            },
                            {
                                view: 'template',
                                datatype: 'image',
                                id: 'cover_template',
                                template: (obj) => {
                                    return '<div class="cover ' + obj.mask + '" width="' + obj.width + 'px"' + ' height="' + obj.height + 'px">' +
                                        '<svg viewBox="0 0 574 503" width="574" height="503">' +
                                        '<image preserveAspectRatio="xMidYMid slice" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="' + obj.src + '" width="574" height="503"/>' +
                                        '</svg>' +
                                        '</div>'
                                },
                                width: 360,
                                borderless: true,
                                on: {
                                    onBeforeRender: (object) => {
                                        let _coverInfo = that._getCoverInfo();
                                        object.src = _coverInfo.path;
                                        object.mask = that.mask;
                                        let _width = window.$$('cover_template').config.width,
                                            _height = 334;
                                        // _height = _width * _coverInfo.heightRatio;

                                        object.width = _width;
                                        object.height = _height;
                                        window.$$('cover_template').config.height = _height;
                                        window.$$('cover_template').resize()
                                    },
                                    validate: function (value) {
                                        return that._checkEpisodesState(value)
                                    },
                                }

                            },
                            {}
                        ]


                    },
                    {
                        width: 10,
                    },
                    {
                        view: "uploader",
                        id: "file-uploader",
                        type: "iconButton",
                        icon: 'upload',
                        upload: "/api/adm/upload",
                        multiple: false,
                        datatype: "json",
                        accept: "image/*",
                        validate: window.webix.rules.isNotEmpty,
                        invalidMessage: "Значение не может быть пустым",
                        inputHeight: 38,
                        width: 38,
                        on: {
                            onBeforeFileAdd: (item) => {
                                let _type = item.file.type.toLowerCase();
                                if (!_type) {
                                    window.webix.message("Поддерживаются только изображения");
                                    return false;
                                }

                                let _metaType = _type.split('/')[0];
                                if (_metaType !== "image") {
                                    window.webix.message("Поддерживаются только изображения");
                                    return false;
                                }

                                that.props.disableButtons()
                            },
                            onUploadComplete: (response) => {
                                let _coverMeta = JSON.stringify(response[0].info);
                                window.$$('cover-file').setValue(response[0].file);
                                window.$$('cover-meta').setValue(_coverMeta);
                                window.$$('cover_template').refresh();
                                that.props.enableButtons()
                            },
                            onFileUploadError: () => {
                                that.props.appActions.showErrorDialog('При загрузке файла произошла ошибка')
                                that.props.enableButtons()
                            },
                        }
                    },
                ]
            },
            {
                view: "combo",
                name: "Mask",
                label: "Маска обложки",
                placeholder: "Выберите маску обложки",
                options: that._getMasks(),
                labelWidth: labelWidth,
                validate: window.webix.rules.isNotEmpty,
                invalidMessage: "Значение не может быть пустым",
                on: {
                    onChange: function () {
                        that._externalValidate(this);
                        that.mask = this.getValue();
                        window.$$('cover_template').refresh()
                    },
                },
            },
            {
                view: "richtext",
                id: "Description",
                label: "Описание курса",
                labelPosition: "top",
                height: 200,
                width: 500,
                name: "Description",
            },
            {
                view: "textarea",
                id: "ext-links-values",
                name: "extLinksValues",
                label: "Ссылки на другие ресурсы",
                labelWidth: labelWidth,
                height: 200,
            },
            {
                view: "checkbox",
                id: 'one-lesson-checkbox',
                label: "Курс с одиночной лекцией",
                name: 'OneLesson',
                labelWidth: labelWidth,
            },
        ];
    }

    _enableApplyChanges() {
        let _enable = super._enableApplyChanges();

        return _enable && (this.props.courseAuthors.length > 0) && (this.props.courseCategories.length > 0)
    }

    handleChangeDataOnWebixForm() {
        if (!window.$$('one-lesson-checkbox')) return

        if (this.props.courseLessons.length <= 1) {
            window.$$('one-lesson-checkbox').enable()
        } else {
            window.$$('one-lesson-checkbox').disable()
        }

    }
}

function mapStateToProps(state, ownProps) {
    return {
        courseId: ownProps.match ? Number(ownProps.match.params.id) : null,

        course: state.singleCourse.current,

        authors: state.authorsList.authors,
        categories: state.categoriesList.categories,

        courseAuthors: state.courseAuthors.current,
        courseCategories: state.courseCategories.current,
        courseLessons: state.courseLessons.current,

        // languages: state.languages.languages,
        // fixFormHasChanges: isDirty('FixingBlock')(state),
        hasChanges: state.singleCourse.hasChanges ||
            state.courseAuthors.hasChanges ||
            state.courseCategories.hasChanges ||
            state.courseLessons.hasChanges || isDirty('FixingBlock')(state),

        fetching: state.authorsList.fetching || state.categoriesList.fetching || state.languages.fetching || state.singleCourse.fetching,
        fixFormValues: getFormValues('FixingBlock')(state),
        fixFormValid: isValid('FixingBlock')(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        appActions: bindActionCreators(appActions, dispatch),
        courseActions: bindActionCreators(singleCourseActions, dispatch),
        authorsActions: bindActionCreators(authorsActions, dispatch),
        categoriesActions: bindActionCreators(categoriesActions, dispatch),
        languagesActions: bindActionCreators(languagesActions, dispatch),



        disableButtons: bindActionCreators(disableButtons, dispatch),
        enableButtons: bindActionCreators(enableButtons, dispatch),
        getParameters: bindActionCreators(getParameters, dispatch),
        setFixedCourse: bindActionCreators(setFixedCourse, dispatch),
        resetReduxForm: bindActionCreators(reset, dispatch),
        focusReduxForm: bindActionCreators(focus, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CourseEditor);