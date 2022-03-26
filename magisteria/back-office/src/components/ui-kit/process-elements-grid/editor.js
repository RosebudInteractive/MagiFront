import React, {useEffect} from "react"
import {Select} from "../../ui-kit";
import {Field, getFormValues, isDirty, reduxForm} from "redux-form";
import {compose} from "redux";
import {connect} from "react-redux";
import {getStatesForSelect} from "#src/tools/elements";

const EDITOR_NAME = "ELEMENT_EDITOR"

// type ElementEditorProps = {
//     editMode: boolean,
//     value: any,
//     editors: Array,
//     elements: Array,
//     onApply: Function,
//     onClose: Function,
// }

// function ElementEditor(props: ElementEditorProps) {
function ElementEditor(props) {
    const {value, editors, elements, editMode, onApply, onClose, editorValues} = props

    useEffect(() => {
        if (value) {
            const element = elements && elements.find(item => item.Name === value.Name)

            props.initialize({
                Name: element && element.Id,
                State: value.State,
                SupervisorId: value.SupervisorId// && value.Supervisor.Id
            })

            if (elements.length === 1) {
                props.change("Name", elements[0].Id)
            }
        }
    }, [value])

    const getEditorsForSelect = () => {
        return editors.map((item) => {
            return {id: item.Id, name: item.DisplayName}
        })
    }

    const getElementsForSelect = () => {
        return elements && elements.map((item) => {
            return {id: item.Id, name: item.Name}
        })
    }

    const _onApply = () => {
        if (onApply) {
            const _value = {
                State: +editorValues.State,
                SupervisorId: editorValues.SupervisorId ? +editorValues.SupervisorId : null// && value.Supervisor.Id
            }

            if (editMode) {
                _value.ElementId = +value.Id
            } else {
                _value.ElementId = +editorValues.Name
            }

            onApply(_value)
        }
    }



    return <form className="modal-form" action={"javascript:void(0)"}>
        <div className="element-editor__dialog modal-form__dialog">
            <h6 className="process-elements-grid__title _grey100">Настройка элемента</h6>
            <Field component={Select} name={"Name"} label={"Имя элемента"} required={true} disabled={editMode} readOnly={editMode} options={getElementsForSelect()}/>
            <Field component={Select} name={"SupervisorId"} options={getEditorsForSelect()}/>
            <Field component={Select} name ={"State"} required={true} options={getStatesForSelect()} disabled={!editMode} readOnly={!editMode}/>
            <button className="element-editor__save-button orange-button big-button" onClick={_onApply} disabled={!props.hasChanges}>
                Применить
            </button>
            <button type="button" className="modal-form__close-button" onClick={onClose}>Закрыть</button>
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
