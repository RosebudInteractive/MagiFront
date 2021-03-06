import React from "react"
import {Field} from "redux-form";
import {Select, Checkbox} from "../../../../ui-kit";
import "./supervisor-block.sass"
import {getState} from "../../../../../tools/elements";
import taskController from "../../../../../tools/task-controller";

type TaskBodyProps = {
    currentElement: any,
    elements: Array,
}

export default function SupervisorBlock(props: TaskBodyProps) {
    const {elements, currentElement} = props

    const _state = getState(currentElement.State)

    const _getElementsList = () => {
        return elements && elements.map(item => ({id: item.Id, name: item.Name}))
    }

    const _getSetsList = () => {
        return Object.keys(currentElement.WriteSets).map(item => ({id: item, name: item}))
    }

    const writeSetEnable = taskController.fieldsEnable.form && Object.keys(currentElement.WriteSets).length > 0

    const _elementsLock = !taskController.fieldsEnable.form || !taskController.fieldsEnable.elements

    return <div className="body__supervisor-block">
        <h6 className="_title _grey100">Элемент</h6>
        <Field component={Select} name={"ElementId"} label={"Название"} options={_getElementsList()} disabled={_elementsLock} readOnly={_elementsLock}/>
        {
            currentElement.Id &&
                <React.Fragment>
                    <div className="supervisor-block__elem-info-block">
                        <Field component={Checkbox} name={"IsElemReady"} label={"Элемент готов"} disabled={_elementsLock} readOnly={_elementsLock}/>
                        <div className={"elem-info-block__item process-element__state font-body-xs " + _state.css}>{_state.caption}</div>
                        {
                            currentElement.Supervisor && currentElement.Supervisor.DisplayName &&
                            <div className="elem-info-block__item _executor font-body-xs _grey100">{currentElement.Supervisor.DisplayName}</div>
                        }
                    </div>
                    {
                        taskController.visibility.writeFieldSet &&
                        <Field component={Select} name={"WriteFieldSet"} label={"Набор полей процесса на запись"}
                               options={_getSetsList()} disabled={!writeSetEnable} readOnly={!writeSetEnable}/>
                    }
                </React.Fragment>
        }
    </div>
}
