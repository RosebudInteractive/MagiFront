import React from 'react'
import {connect} from "react-redux";
import {bindActionCreators} from 'redux';
import {reduxForm, Field, formValueSelector, change as changeFieldValue} from 'redux-form'
import {CheckBox, TextBox,} from '../common/input-controls'
import TextArea from '../common/text-area'
import Select from '../common/select-control'
import Cover from '../common/masked-cover-control'
import PropTypes from 'prop-types'
import {fixedCourseIdSelector, fixedObjDescrSelector, parametersFetchingSelector,} from "adm-ducks/params"
import '../common/form.sass'

class CourseSubscriptionForm extends React.Component {

    static propTypes = {
        editMode: PropTypes.bool,
        visible: PropTypes.bool,
    }

    componentDidMount() {
        this._init()
    }

    _init() {
        let {course, fixedCourseId, fixDescription,} = this.props,
            _fixed = (course && (course.id === fixedCourseId)),
            _fixDescription = _fixed ? fixDescription : ''

        if (course) {
            this.props.initialize({
                name: course.Name,
                URL: course.URL,
                state: course.State,
                languageId: course.LanguageId,
                description: course.Description,
                extLinksValues: course.extLinksValues,
                cover: {
                    file: course.Cover,
                    meta: course.CoverMeta,
                    mask: course.Mask,
                },
                oneLesson: course.OneLesson,
                fixed: _fixed,
                fixDescription: _fixDescription,
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
        let {course, courseLessons, fixedCourseId, fixDescription, visible,} = this.props,
            _fixed = (course && (course.id === fixedCourseId)),
            _fixDescription = _fixed ? fixDescription : ''

        let _disabled = false;

        let _oneLessonDisable = _disabled || (courseLessons.length > 1)

        return <div className={"form-wrapper non-webix-form" + (visible ? '' : ' hidden')}>
            <form className="controls-wrapper">
                <Field component={CheckBox} name="IsPaid" label="Платностный"/>
                <Field component={CheckBox} name="IsSubsFree" label="Бесплатный в рамках подписки"/>
                <Field component={TextBox} name="Price" label="Цена" placeholder="Введите цену" disabled={_disabled}/>
                <Field component={TextBox} name="DPrice" label="Цена со скидкой" placeholder="Введите цену" disabled={_disabled}/>
                <div className="group-box">
                    <div className="group-box__title">Скидка</div>
                    <Field component={TextBox} name="Description" label="Описание скидки" placeholder="Введите описание" disabled={_disabled}/>
                    <Field component={TextBox} name="Perc" label="Процент скидки" placeholder="Введите значение" disabled={_disabled}/>
                    <Field component={Datetime} name="FirstDate" label="начало действия"/>
                </div>
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

const validate = (values, props) => {

    const errors = {}

    if (!values.name) {
        errors.name = 'Значение не может быть пустым'
    }

    if (!values.URL) {
        errors.URL = 'Значение не может быть пустым'
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

let CourseSubscriptionWrapper = reduxForm({
    form: 'CourseSubscriptionForm',
    validate,
})(CourseSubscriptionForm);

const selector = formValueSelector('CourseEditor')

CourseSubscriptionWrapper = connect(state => {
    return {
        isFixedActive: selector(state, 'fixed'),
        isOneLessonActive: selector(state, 'oneLesson'),
        descriptionFix: selector(state, 'fixDescription'),
    }
})(CourseSubscriptionWrapper)

function mapStateToProps(state) {
    return {
        course: state.singleCourse.current,
        courseSaving: state.singleCourse.saving,
        courseError: state.singleCourse.error,
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CourseSubscriptionWrapper)