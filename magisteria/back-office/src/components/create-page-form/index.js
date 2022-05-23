import React, {useEffect, useState, useCallback} from "react"
import {change, Field, getFormValues, isDirty, isValid, reduxForm} from "redux-form";
import {Autocomplete, Checkbox, Select, TextBox} from "../ui-kit";
import "./create-page-form.sass"
import {compose, bindActionCreators} from "redux";
import {connect} from "react-redux";
import $ from "jquery";
import { taskTypesSelector,
         getTaskTypes } from "#src/ducks/task";

const EDITOR_NAME = "CREATE_PROCESS_FORM"

function CreateProcessForm(props) {
    const {supervisors, users, onClose, lessons, editorValues, userId, canChangeSupervisor, taskTypes, getTaskTypes} = props

    const [typesLoaded, setTypesLoaded] = useState(false);
    useEffect(() => {
        if (!typesLoaded){
            getTaskTypes();
            setTypesLoaded(true);
        };
    }, [typesLoaded]);

    const onApply = () => {
        if (props.editorValid) {
            props.onApply({
                Name: editorValues.Name,
                LessonId: +editorValues.LessonId,
                SupervisorId: editorValues.SupervisorId ? +editorValues.SupervisorId : null,
                Params: {
                    UseAuthorPictures: editorValues.UseAuthorPictures,
                    UseMusic: editorValues.UseMusic,
                    HasTest: editorValues.HasTest,
                    HasLiterature: editorValues.HasLiterature,
                    ExecutorSound: editorValues.ExecutorSound ? +editorValues.ExecutorSound : null,
                    ExecutorSoundControl: editorValues.ExecutorSoundControl ? +editorValues.ExecutorSoundControl : null,
                    ExecutorTranscript: editorValues.ExecutorTranscript ? +editorValues.ExecutorTranscript : null,
                    ExecutorPictures: editorValues.ExecutorPictures ? +editorValues.ExecutorPictures : null,
                    ExecutorPicturesControl: editorValues.ExecutorPicturesControl ? +editorValues.ExecutorPicturesControl : null,
                    ExecutorText: editorValues.ExecutorText ? +editorValues.ExecutorText : null,
                    ExecutorLiterature: editorValues.ExecutorLiterature ? +editorValues.ExecutorLiterature : null,
                    ExecutorReadyComponents: editorValues.ExecutorReadyComponents ? +editorValues.ExecutorReadyComponents : null,
                    ExecutorTest: editorValues.ExecutorTest ? +editorValues.ExecutorTest : null,
                    StructName: "Lesson Process Proto"
                }
            })
        }
    }

    const getSupervisors = () => {
        return supervisors && supervisors.map((item) => {return {id: item.Id, name: item.DisplayName}})
    }

    const getLessons = () => {
        return lessons && lessons.map((item) => {return {id: item.Id, name: item.Name}})
    }

    const getFilteredUsers = useCallback((taskTypeCode)=>{
        let filteredUsers = users;
        if (taskTypes && taskTypes.length && users){
            const taskType = taskTypes.find( elem => elem.Code === taskTypeCode);
            if (taskType){
                const rolesOfTaskType = taskType.Roles.map( elem => elem.ShortCode );
                filteredUsers = users.filter( user => ( rolesOfTaskType.find( value => user.PData.roles[value]===1 ) ) );
            };
        };
        return filteredUsers && filteredUsers.map((item) => {return {id: item.Id, name: item.DisplayName}})
    }, [taskTypes, users]);

    useEffect(() => {
        props.initialize({
            Name: "",
            LessonId: null,
            SupervisorId: userId,
            UseAuthorPictures: false,
            UseMusic: false,
            HasTest: false,
            HasLiterature: false,
        })

        $("body").addClass("_no-vertical-scroll")

        return () => {
            $("body").removeClass("_no-vertical-scroll")
        }
    }, [])

    useEffect(() => {
        if (props.editorValues && props.editorValues.LessonId) {
            let selectedLesson = lessons && lessons.find(lesson => lesson.Id === props.editorValues.LessonId)
            if (!props.editorValues.Name) {
                props.change(EDITOR_NAME, "Name", selectedLesson.Name)
            }
            props.change(EDITOR_NAME, "HasLiterature", selectedLesson && !selectedLesson.IsSubLesson)
        }
    }, [props.editorValues && props.editorValues.LessonId])

    return typesLoaded && <form className="modal-form" action={"javascript:void(0)"}>
        <div className="modal-form__dialog create-process-dialog _with-custom-scroll">
            <h6 className="_grey100">Создание нового процесса</h6>
            <Field component={TextBox} name={"Name"} label={"Название"} extClass={'height-100-input-inside-mui-form-control'}/>
            <Field component={Autocomplete} name={"LessonId"} label={"Лекция"} options={getLessons()}/>
            <Field component={Select} name={"SupervisorId"} label={"Супервизор"} options={getSupervisors()} required={true} readOnly={!canChangeSupervisor} disabled={!canChangeSupervisor}/>
            <div className="dialog__fields-wrapper _with-custom-scroll">
                <Field component={Checkbox} name={"UseAuthorPictures"} label={"Картинки автора"}/>
                <Field component={Checkbox} name={"UseMusic"} label={"Музыка"}/>
                <Field component={Checkbox} name={"HasTest"} label={"Тесты"}/>
                <Field component={Checkbox} name={"HasLiterature"} label={"Литература"}/>
                <Field component={Select} name={"ExecutorSound"} label={"Исполнитель - Звук"} options={getFilteredUsers('PSOUND')}/>
                <Field component={Select} name={"ExecutorSoundControl"} label={"Исполнитель - Звук контроль"} options={getFilteredUsers('CSOUND')}/>
                <Field component={Select} name={"ExecutorTranscript"} label={"Исполнитель - Транскрипт"} options={getFilteredUsers('TRANS')}/>
                <Field component={Select} name={"ExecutorPictures"} label={"Исполнитель - Иллюстрации"} options={getFilteredUsers('FPIC')}/>
                <Field component={Select} name={"ExecutorPicturesControl"} label={"Исполнитель - Иллюстрации контроль"} options={getFilteredUsers('MPIC')}/>
                <Field component={Select} name={"ExecutorText"} label={"Исполнитель - Тех. стенограмма"} options={getFilteredUsers('ETRANS')}/>
                <Field component={Select} name={"ExecutorLiterature"} label={"Исполнитель - Литература"} options={getFilteredUsers('LIT')}/>
                <Field component={Select} name={"ExecutorReadyComponents"} label={"Исполнитель - Готовые компоненты"} options={getFilteredUsers('FIN')}/>
                <Field component={Select} name={"ExecutorTest"} label={"Исполнитель - Тесты"} options={getFilteredUsers('TEST')}/>
            </div>
            <button className="element-editor__save-button orange-button big-button" onClick={onApply} disabled={!(props.hasChanges && props.editorValid)}>
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
        taskTypes: taskTypesSelector(state),
        hasChanges: isDirty(EDITOR_NAME)(state),
        editorValues: getFormValues(EDITOR_NAME)(state),
        editorValid: isValid(EDITOR_NAME)(state),
    }
}

const mapDispatch2Props = (dispatch) => {
    return bindActionCreators({change, getTaskTypes}, dispatch)
};

const enhance = compose(
    reduxForm({form: EDITOR_NAME, validate}),
    connect(mapState2Props, mapDispatch2Props)
)

export default enhance(CreateProcessForm)
