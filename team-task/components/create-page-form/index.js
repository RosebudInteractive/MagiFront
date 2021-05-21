import React, {useEffect} from "react"
import {change, Field, getFormValues, isDirty, isValid, reduxForm} from "redux-form";
import {Checkbox, Select, TextBox} from "../ui-kit";
import "./create-page-form.sass"
import {compose} from "redux";
import {connect} from "react-redux";
import $ from "jquery";

const EDITOR_NAME = "CREATE_PROCESS_FORM"

function CreateProcessForm(props) {
    const {supervisors, users, onClose, lessons, editorValues, userId, canChangeSupervisor} = props

    const _onApply = () => {
        if (props.editorValid) {
            props.onApply({
                Name: editorValues.Name,
                LessonId: +editorValues.LessonId,
                SupervisorId: editorValues.SupervisorId ? +editorValues.SupervisorId : null,
                Params: {
                    UseAuthorPictures: editorValues.UseAuthorPictures,
                    UseMusic: editorValues.UseMusic,
                    ExecutorSound: editorValues.ExecutorSound ? +editorValues.ExecutorSound : null,
                    ExecutorSoundControl: editorValues.ExecutorSoundControl ? +editorValues.ExecutorSoundControl : null,
                    ExecutorTranscript: editorValues.ExecutorTranscript ? +editorValues.ExecutorTranscript : null,
                    ExecutorPictures: editorValues.ExecutorPictures ? +editorValues.ExecutorPictures : null,
                    ExecutorPicturesControl: editorValues.ExecutorPicturesControl ? +editorValues.ExecutorPicturesControl : null,
                    ExecutorText: editorValues.ExecutorText ? +editorValues.ExecutorText : null,
                    ExecutorLiterature: editorValues.ExecutorLiterature ? +editorValues.ExecutorLiterature : null,
                    ExecutorReadyComponents: editorValues.ExecutorReadyComponents ? +editorValues.ExecutorReadyComponents : null,
                    StructName: "Lesson Process Proto"
                }
            })
        }
    }

    const _getSupervisors = () => {
        return supervisors && supervisors.map((item) => {return {id: item.Id, name: item.DisplayName}})
    }

    const _getUsers = () => {
        return users && users.map((item) => {return {id: item.Id, name: item.DisplayName}})
    }

    const _getLessons = () => {
        return lessons && lessons.map((item) => {return {id: item.Id, name: item.Name}})
    }

    useEffect(() => {
        props.initialize({
            Name: "",
            LessonId: null,
            SupervisorId: userId
        })

        $("body").addClass("_no-vertical-scroll")

        return () => {
            $("body").removeClass("_no-vertical-scroll")
        }
    }, [])

    useEffect(() => {
        if (props.editorValues && !props.editorValues.Name && props.editorValues.LessonId) {
            let _lesson = lessons && lessons.find(lesson => lesson.Id === props.editorValues.LessonId)
            props.change(EDITOR_NAME, "Name", _lesson.Name)
        }
    }, [props.editorValues && props.editorValues.LessonId])

    return <form className="modal-form" action={"javascript:void(0)"}>
        <div className="modal-form__dialog create-process-dialog _with-custom-scroll">
            <h6 className="_grey100">Создание нового процесса</h6>
            <Field component={TextBox} name={"Name"} label={"Название"}/>
            <Field component={Select} name={"LessonId"} label={"Лекция"} options={_getLessons()}/>
            <Field component={Select} name={"SupervisorId"} label={"Супервизор"} options={_getSupervisors()} required={true} readOnly={!canChangeSupervisor} disabled={!canChangeSupervisor}/>
            <Field component={Checkbox} name={"UseAuthorPictures"} label={"Картинки автора"}/>
            <Field component={Checkbox} name={"UseMusic"} label={"Музыка"}/>
            <Field component={Select} name={"ExecutorSound"} label={"Исполнитель - Звук"} options={_getUsers()}/>
            <Field component={Select} name={"ExecutorSoundControl"} label={"Исполнитель - Звук контроль"} options={_getUsers()}/>
            <Field component={Select} name={"ExecutorTranscript"} label={"Исполнитель - Транскрипт"} options={_getUsers()}/>
            <Field component={Select} name={"ExecutorPictures"} label={"Исполнитель - Иллюстрации"} options={_getUsers()}/>
            <Field component={Select} name={"ExecutorPicturesControl"} label={"Исполнитель - Иллюстрации контроль"} options={_getUsers()}/>
            <Field component={Select} name={"ExecutorText"} label={"Исполнитель - Тех. стенограмма"} options={_getUsers()}/>
            <Field component={Select} name={"ExecutorLiterature"} label={"Исполнитель - Литература"} options={_getUsers()}/>
            <Field component={Select} name={"ExecutorReadyComponents"} label={"Исполнитель - Готовые компоненты"} options={_getUsers()}/>
            <button className="element-editor__save-button orange-button big-button" onClick={_onApply} disabled={!props.hasChanges}>
                Применить
            </button>
            <button type="button" className="modal-form__close-button" onClick={onClose}>Закрыть</button>
        </div>
    </form>
}


const validate = (values) => {
    const errors = {}

    if (!values.LessonId) {
        errors.LessonId = "Обязательное поле"
    }

    return errors
}

const mapState2Props = (state) => {
    return {
        hasChanges: isDirty(EDITOR_NAME)(state),
        editorValues: getFormValues(EDITOR_NAME)(state),
        editorValid: isValid(EDITOR_NAME)(state),
    }
}

const mapDispatch2Props = {
    change
};

const enhance = compose(
    reduxForm({form: EDITOR_NAME, validate}),
    connect(mapState2Props, mapDispatch2Props)
)

export default enhance(CreateProcessForm)
