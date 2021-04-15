import React, {useEffect, useRef, useMemo, useState} from "react"
import {Field, getFormValues, isDirty, isValid, reduxForm,} from "redux-form";
import {Select, Checkbox} from "../ui-kit";
import "./create-page-form.sass"

const EDITOR_NAME = "CREATE_PROCESS_FORM"

function CreateProcessForm(props) {
    const {users, onClose, lessons} = props

    const _onApply = () => {
        props.onApply()
    }

    const _getUsers = () => {
        return users && users.map((item) => {return {id: item.Id, name: item.DisplayName}})
    }

    const _getLessons = () => {
        return lessons && lessons.map((item) => {return {id: item.Id, name: item.Name}})
    }

    return <form className="modal-form" action={"javascript:void(0)"}>
        <div className="element-editor__dialog">
            <h6 className="process-elements-grid__title _grey100">Созднание нового процесса</h6>
            <Field component={Select} name={"LessonId"} label={"Лекция"} options={_getLessons()}/>
            <Field component={Checkbox} name={"UseAuthorPictures"} label={"Картинки автора"}/>
            <Field component={Checkbox} name={"UseMusic"} label={"Музыка"}/>
            <Field component={Select} name={"ExecutorSound"} label={"Исполнитель - Звук"} options={_getUsers()}/>
            <Field component={Select} name={"ExecutorSoundControl"} label={"Исполнитель - Звук контроль"} options={_getUsers()}/>
            <Field component={Select} name={"ExecutorTranscript"} label={"Исполнитель - Транскрипт"} options={_getUsers()}/>
            <Field component={Select} name={"ExecutorPictures"} label={"Исполнитель - Иллюстрации"} options={_getUsers()}/>
            <Field component={Select} name={"ExecutorPicturesControl"} label={"Исполнитель - Иллюстрации контроль"} options={_getUsers()}/>
            <Field component={Select} name={"ExecutorText"} label={"Исполнитель - тех. стенограмма"} options={_getUsers()}/>
            <Field component={Select} name={"ExecutorLiterature"} label={"Исполнитель - Литература"} options={_getUsers()}/>
            <button className="element-editor__save-button orange-button big-button" onClick={_onApply} disabled={!props.hasChanges}>
                Применить
            </button>
            <button type="button" className="element-editor__close-button" onClick={onClose}>Закрыть</button>
        </div>
    </form>
}


const validate = (values) => {
    const errors = {}

    return errors
}

export default reduxForm({form: EDITOR_NAME, validate})(CreateProcessForm)
