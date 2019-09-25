import React from 'react'
import {Field, formValueSelector, reduxForm,} from 'redux-form'
import {CheckBox,} from "../../common/input-controls";
import TimeInput from "../../common/masked-controls/time-input";
import TextArea from "../../common/text-area";
import PropTypes from "prop-types";
import {enableButtonsSelector} from "adm-ducks/app";
import {connect} from "react-redux";
import Cover from "../../common/cover-with-cross";

export const LAYOUT_VER2_FORM = 'LayoutVer2Form'

class LayoutVer2Form extends React.Component {

    static propTypes = {
        editMode: PropTypes.bool,
        visible: PropTypes.bool,
    }

    componentDidMount() {
        this._init()
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
        const {isLandingPage} = this.props,
            _disabled = !this.props.enableButtons || !isLandingPage;

        return <div className={"form-wrapper non-webix-form" + (this.props.visible ? '' : ' hidden')}>
            <form className="controls-wrapper layout-ver2-tab">
                <Field component={CheckBox} name="isLandingPage" label="Использовать новый формат" disabled={!this.props.enableButtons}/>
                <Field component={TextArea} name="shortDescription" label="Краткое описание" enableHtml={true} disabled={_disabled}/>
                <Field component={TextArea} name="targetAudience" label="Кому подойдет этот курс" enableHtml={true} disabled={_disabled}/>
                <Field component={TextArea} name="aims" label="Чему вы научитесь" enableHtml={true} disabled={_disabled}/>
                <Field component={TimeInput} name="estDuration" label="Ожидаемая длительность" disabled={_disabled}/>
                <Field component={Cover} name="cover" label="Обложка лекции" disabled={_disabled}/>
            </form>
        </div>
    }

    _init() {
        let {course,} = this.props

        if (course) {
            this.props.initialize({
                isLandingPage: course.IsLandingPage,
                shortDescription: course.ShortDescription,
                targetAudience: course.TargetAudience,
                aims: course.Aims,
                estDuration: course.EstDuration ? course.EstDuration : undefined,
                cover: {
                    file: course.LandCover,
                    meta: course.LandCoverMeta,
                },
            });
        }
    }
}

const validate = (values,) => {

    const errors = {}

    if (values.isLandingPage) {

        if (!values.shortDescription) {
            errors.shortDescription = 'Значение не может быть пустым'
        }

        if (!values.targetAudience) {
            errors.targetAudience = 'Значение не может быть пустым'
        }

        if (!values.aims) {
            errors.aims = 'Значение не может быть пустым'
        }

        if (isNaN(values.estDuration)) {
            errors.estDuration = 'Неверное занечение'
        }
    }

    return errors
}

let FormWrapper = reduxForm({
    form: LAYOUT_VER2_FORM,
    validate,
    touchOnChange: true,
    touchOnBlur: true
})(LayoutVer2Form);

const selector = formValueSelector(LAYOUT_VER2_FORM)

FormWrapper = connect(state => {
    return {
        isLandingPage: selector(state, 'isLandingPage'),
    }
})(FormWrapper)

function mapStateToProps(state) {
    return {
        course: state.singleCourse.current,
        courseSaving: state.singleCourse.saving,
        courseError: state.singleCourse.error,
        enableButtons: enableButtonsSelector(state),
    }
}

export default connect(mapStateToProps,)(FormWrapper)
