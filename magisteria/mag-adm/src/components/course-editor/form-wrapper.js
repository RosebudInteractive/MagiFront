import React from 'react'
import {connect} from "react-redux";
import {bindActionCreators} from 'redux';
import {change as changeFieldValue, Field, formValueSelector, reduxForm} from 'redux-form'
import {CheckBox, TextBox,} from '../common/input-controls'
import TextArea from '../common/text-area'
import Select from '../common/select-control'
import Cover from '../common/masked-cover-control'
import PropTypes from 'prop-types'
import {fixedCourseIdSelector, fixedObjDescrSelector, parametersFetchingSelector,} from "adm-ducks/params"
import '../common/form.sass'
import {enableButtonsSelector} from "adm-ducks/app";
import {isYoutubeLink} from '../../tools/link-tools'

const STATE_OPTIONS = [
        {id: 'D', value: 'Черновик'},
        {id: 'P', value: 'Опубликованный'},
        {id: 'A', value: 'Архив'}
    ],
    COURSE_TYPES = [
        {id: 1, value: 'Теория'},
        {id: 2, value: 'Практика'}
    ]

class CourseEditorForm extends React.Component {

    static propTypes = {
        editMode: PropTypes.bool,
        visible: PropTypes.bool,
    }

    componentDidMount() {
        this._init()
    }

    _init() {
        let {course, fixedCourseId, fixDescription,} = this.props,
            _fixed = (course && (course.id !== undefined) && (course.id === fixedCourseId)),
            _fixDescription = _fixed ? fixDescription : ''

        if (course) {
            this.props.initialize({
                name: course.Name,
                URL: course.URL,
                state: course.State,
                languageId: course.LanguageId,
                description: course.Description,
                shortDescription: course.ShortDescription,
                targetAudience: course.TargetAudience,
                aims: course.Aims,
                extLinksValues: course.extLinksValues,
                cover: {
                    file: course.Cover,
                    meta: course.CoverMeta,
                    mask: course.Mask,
                },
                coverDescription: course.CoverDescription,
                oneLesson: course.OneLesson,
                fixed: _fixed,
                fixDescription: _fixDescription,
                videoIntroLink: course.VideoIntroLink,
                videoIntwLink: course.VideoIntwLink,
                courseType: course.CourseType
            });
        }
    }

    componentWillUnmount() {
        this.props.reset();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.courseSaving && !this.props.courseSaving && !this.props.courseError) {
            this.props.destroy();
            this._init()
        }
    }

    render() {
        let {course, courseLessons, fixedCourseId, fixDescription, visible, enableButtons} = this.props,
            _fixed = (course && (course.id === fixedCourseId)),
            _fixDescription = _fixed ? fixDescription : ''

        let _disabled = !enableButtons;

        let _oneLessonDisable = _disabled || (courseLessons.length > 1)

        return <div className={"form-wrapper non-webix-form" + (visible ? '' : ' hidden')}>
            <form className="controls-wrapper">
                <Field component={TextBox} name="name" label="Название курса" placeholder="Введите название"
                       disabled={_disabled}/>
                <Field component={TextBox} name="URL" label="URL" placeholder="Введите URL" disabled={_disabled}/>
                <Field component={Select} name="state" label="Состояние" placeholder="Выберите состояние"
                       options={STATE_OPTIONS} disabled={_disabled}/>
                <Field component={Select} name="languageId" label="Язык" placeholder="Выберите язык"
                       options={this._getLanguagesArray()} disabled={_disabled}/>
                <Field component={Select} name="courseType" label="Тип курса" placeholder="Выберите тип курса"
                       options={COURSE_TYPES} disabled={_disabled}/>
                <Field component={TextArea} enableHtml={true} name="description" label="Описание курса" disabled={_disabled}/>
                {/*<Field component={TextArea} enableHtml={true} name="shortDescription" label="Краткое описание курса" disabled={_disabled}/>*/}
                {/*<Field component={TextArea} enableHtml={true} name="targetAudience" label="Кому подойдет этот курс" disabled={_disabled}/>*/}
                {/*<Field component={TextArea} enableHtml={true} name="aims" label="Чему вы научитесь" disabled={_disabled}/>*/}
                <Field component={TextArea} enableHtml={false} name="extLinksValues" label="Ссылки на другие ресурсы"
                       disabled={_disabled}/>
                <Field component={Cover} name="cover" label="Обложка курса" disabled={_disabled}/>
                <Field component={TextBox} name="coverDescription" label="Описание обложки курса" disabled={_disabled}/>
                <Field component={CheckBox} name="oneLesson" label="Курс с одиночной лекцией"
                       disabled={_oneLessonDisable}/>
                <Field component={TextBox} name="videoIntroLink" label="Презентация курса" placeholder="Введите URL YouTube"
                       disabled={_disabled}/>
                <Field component={TextBox} name="videoIntwLink" label="Интервью с автором" placeholder="Введите URL YouTube"
                       disabled={_disabled}/>
                <Field component={CheckBox} name="fixed" label="Зафиксировать курс" disabled={!this._canFixCourse() || _disabled}/>
                <Field component={TextArea} enableHtml={true} name="fixDescription" label="Описание" hidden={!this.props.isFixedActive}
                       value={_fixDescription} disabled={_disabled}/>
            </form>
        </div>
    }

    _getLanguagesArray() {
        return this.props.languages.map((elem) => {
            return {id: elem.id, value: elem.Language};
        })
    }

    _canFixCourse() {
        let {course, isOneLessonActive,} = this.props;

        return ((course && !course.OneLesson) || !isOneLessonActive)
    }
}

const validate = (values, props) => {

    const errors = {}

    if (!values.name) {
        errors.name = 'Значение не может быть пустым'
    }

    if (!values.URL) {
        errors.URL = 'Значение не может быть пустым'
    }

    if (!values.targetAudience) {
        errors.targetAudience = 'Значение не может быть пустым'
    }

    if (!values.aims) {
        errors.aims = 'Значение не может быть пустым'
    }

    if (!_checkLessonsState(values.state, props.courseLessons)) {
        errors.state = 'Недопустимое состояние'
    }

    if (!values.languageId) {
        errors.languageId = 'Значение не может быть пустым'
    }

    if (!values.cover || !values.cover.file) {
        errors.cover = 'Значение не может быть пустым'
    }

    if (values.fixed && !values.fixDescription) {
        errors.fixDescription = 'Значение не может быть пустым'
    }

    if (values.videoIntroLink && !isYoutubeLink(values.videoIntroLink)) {
        errors.videoIntroLink = 'Необходима ссылка на YouTube'
    }

    if (values.videoIntwLink && !isYoutubeLink(values.videoIntwLink)) {
        errors.videoIntwLink = 'Необходима ссылка на YouTube'
    }

    return errors
}

function _checkLessonsState(newState, courseLessons) {
    if (!newState) {
        return false
    }

    if (newState === 'P') {
        return courseLessons.some((lesson) => {
            return lesson.State === 'R'
        })
    } else {
        return true
    }
}

let CourseEditorWrapper = reduxForm({
    form: 'CourseEditor',
    validate,
})(CourseEditorForm);

const selector = formValueSelector('CourseEditor')

CourseEditorWrapper = connect(state => {
    return {
        isFixedActive: selector(state, 'fixed'),
        isOneLessonActive: selector(state, 'oneLesson'),
        descriptionFix: selector(state, 'fixDescription'),
    }
})(CourseEditorWrapper)

function mapStateToProps(state) {
    return {
        course: state.singleCourse.current,
        courseSaving: state.singleCourse.saving,
        courseError: state.singleCourse.error,
        languages: state.languages.languages,
        courseLessons: state.courseLessons.current,
        fetching: state.singleCourse.fetching || parametersFetchingSelector(state),
        fixedCourseId: fixedCourseIdSelector(state),
        fixDescription: fixedObjDescrSelector(state),
        enableButtons: enableButtonsSelector(state),
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({ changeFieldValue }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(CourseEditorWrapper)
