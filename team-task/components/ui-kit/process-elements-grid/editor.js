import React, {useEffect} from "react"
import {Select} from "../../ui-kit";
import {Field, getFormValues, isDirty, reduxForm} from "redux-form";
import {compose} from "redux";
import {connect} from "react-redux";
import {getStatesForSelect} from "../../../tools/elements";

const EDITOR_NAME = "ELEMENT_EDITOR"

type ElementEditorProps = {
    editMode: boolean,
    value: any,
    editors: Array,
    elements: Array,
    onApply: Function,
    onClose: Function,
}

function ElementEditor(props: ElementEditorProps) {
    const {value, editors, editMode, onApply, onClose} = props

    useEffect(() => {
        if (value) {
            props.initialize({
                Name: value.Name,
                State: value.State,
                SupervisorId: value.Supervisor && value.Supervisor.Id
            })
        }
    }, [value])

    const getEditorForSelect = () => {
        return editors.map((item) => {
            return {id: item.Id, name: item.DisplayName}
        })
    }

    return <form className="modal-form" action={"javascript:void(0)"}>
        <div className="element-editor__dialog">
            <h6 className="process-elements-grid__title _grey100">Настройка элемента</h6>
            <Field component={Select} name={"Name"} label={"Имя элемента"} disabled={editMode} readOnly={editMode} option={props.elements}/>
            <Field component={Select} name={"SupervisorId"} options={getEditorForSelect()}/>
            <Field component={Select} name ={"State"} options={getStatesForSelect()}/>
            <button className="element-editor__save-button orange-button big-button" onClick={onApply} disabled={!props.hasChanges}>
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

const mapState2Props = (state) => {
    return {
        hasChanges: isDirty(EDITOR_NAME)(state),
        editorValues: getFormValues(EDITOR_NAME)(state),
    }
}

const enhance = compose(
    reduxForm({form: EDITOR_NAME, validate}),
    connect(mapState2Props, )
)

export default enhance(ElementEditor)
