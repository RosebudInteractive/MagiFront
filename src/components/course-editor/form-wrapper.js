import React from 'react'
import {connect} from "react-redux";
import {reduxForm, Field, formValueSelector,} from 'redux-form'
import {CheckBox, TextBox, ImageBox} from '../common/input-controls'
import TextArea from '../common/text-area'
import Select from '../common/select-control'
import PropTypes from 'prop-types'
import '../common/form.sass'

const STATE_OPTIONS = [
    {id: 'D', value: 'Черновик'},
    {id: 'P', value: 'Опубликованный'},
    {id: 'A', value: 'Архив'}
]

class CourseEditorForm extends React.Component {

    static propTypes = {
        editMode: PropTypes.bool
    }

    componentDidMount() {
        let {course} = this.props;

        if (course) {
            this.props.initialize({
                name: course.Name,
                URL: course.URL,
                state: course.State,
                // languageId: course.LanguageId,
                description: course.Description});
        }
    }

    componentWillUnmount() {
        this.props.reset();
    }

    componentDidUpdate(prevProps) {
        let {course} = this.props;

        if (prevProps.fetching && !this.props.fetching && course) {
            this.props.destroy();
            this.props.initialize({name: course.Name, URL: course.URL, description: course.Description});
        }
    }

    render() {
        let {courseLessons, isFixedActive} = this.props;
        let _disabled = false;

        let _oneLessonDisable = _disabled || (courseLessons.length > 1)

        return <div className="form-wrapper non-webix-form">
            <form className="controls-wrapper">
                <Field component={TextBox} name="name" label="Название курса" placeholder="Введите название" disabled={_disabled}/>
                <Field component={TextBox} name="URL" label="URL" placeholder="Введите URL" disabled={_disabled}/>
                <Field component={Select} name="state" label="Состояние" placeholder="Выберите состояние" options={STATE_OPTIONS} disabled={_disabled}/>
                <Field component={Select} name="languageId" label="Язык" placeholder="Выберите язык" options={this._getLanguagesArray()} disabled={_disabled}/>
                <Field component={TextArea} name="description" label="Описание курса" disabled={_disabled}/>
                <Field component={TextArea} name="extLinksValues" label="Ссылки на другие ресурсы" disabled={_disabled}/>
                <Field component={ImageBox} name="extLinksValues" label="Обложка курса" disabled={_disabled}/>
                <Field component={CheckBox} name="oneLesson" label="Курс с одиночной лекцией" disabled={_oneLessonDisable}/>
                <Field component={CheckBox} name="fixed" label="Зафиксировать курс" disabled={!this._canFixCourse()}/>
                <Field component={TextArea} name="fixDescription" label="Описание" hidden={!isFixedActive}
                       onBlur={::this.props.validate} defaultValue={"this.props.descr"}/>
            </form>
        </div>
    }

    _getLanguagesArray() {
        return this.props.languages.map((elem) => {
            return {id: elem.id, value: elem.Language};
        })
    }

    _canFixCourse() {
        let {course, isOneLessonActive} = this.props;

        return ((course && !course.OneLesson) || !isOneLessonActive)
    }

}

const validate = values => {
    const errors = {}

    if (!values.name) {
        errors.name = 'Значение не может быть пустым'
    }

    if (!values.URL) {
        errors.URL = 'Значение не может быть пустым'
    }

    if (values.fixed && !values.fixDescription) {
        errors.description = 'Значение не может быть пустым'
    }

    return errors
}

let CourseEditorWrapper = reduxForm({
    form: 'CourseEditor',
    validate,
})(CourseEditorForm);

const selector = formValueSelector('CourseEditor')

CourseEditorWrapper = connect(state => {
    return {
        isFixedActive : selector(state, 'fixed'),
        isOneLessonActive : selector(state, 'oneLesson'),
        descriptionFix :selector(state, 'fixDescription'),
    }
})(CourseEditorWrapper)

function mapStateToProps(state) {
    return {
        course: state.singleCourse.current,
        languages: state.languages.languages,
        courseLessons: state.courseLessons.current,
        fetching: state.singleCourse.fetching,
    }
}

export default connect(mapStateToProps,null)(CourseEditorWrapper)